"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { useFormHandler } from "@/hooks/use-form"
import { useStockStore } from "@/stores/stock-store"
import { useProductStore } from "@/stores/product-store"
import { useBranchStore } from "@/stores/branch-store"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { ViewToggle } from "@/components/ui/view-toggle"
import { FormComboBox, FormInput, FormTextArea } from "@/components/form"
import { createEntryAndUpdateStock, updateStock, deleteStock } from "@/app/actions/stocks"
import { Plus, Search, Warehouse, Loader2, RefreshCw, AlertTriangle, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { usePermissions } from "@/hooks/use-permissions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function InventoryPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStock, setEditingStock] = useState(null)
  const [showLowStock, setShowLowStock] = useState(false)
  const { t } = useTranslation("ui")
  const { canCreate, canUpdate, canDelete } = usePermissions()
  const { items: stocks, isLoading, error, fetch } = useStockStore()
  const { items: products, isLoading: prodLoading, fetch: fetchProducts } = useProductStore()
  const { items: branches, isLoading: branchLoading, fetch: fetchBranches } = useBranchStore()
  const { formData, resetForm, setFormData, handleChange, getSubmissionData } = useFormHandler({
    productId: "",
    branchId: "",
    quantity: 0,
    unit: "unit",
    memo: "",
    entryPrice: 0,
    invoice: "",
    entryDate: new Date().toISOString(),
    supplierId: null,
    status: "active",
  })

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetch({ search: searchTerm, lowStock: showLowStock }),
        fetchProducts(),
        fetchBranches(),
      ])
    }
    loadData()
  }, [fetch, fetchProducts, fetchBranches, searchTerm, showLowStock])

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.Product?.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.Product?.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.memo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockCount = filteredStocks.filter((stock) => stock.quantity < 50).length
  const totalQuantity = filteredStocks.reduce((sum, stock) => sum + stock.quantity, 0)

  const tableColumns = [
    {
      key: "productName",
      label: t("Product"),
      type: "image",
      render: (_value, row) => (
        <div>
          <div className="font-medium">{row.Product?.productName || "N/A"}</div>
          {row.Product?.productCode && (
            <div className="text-sm text-muted-foreground">{row.Product.productCode}</div>
          )}
        </div>
      ),
    },
    { key: "branchName", label: t("Branch"), render: (_value, row) => row.Branch?.branchName || "N/A" },
    {
      key: "categoryName",
      label: t("Category"),
      render: (_value, row) => row.Product?.Category?.categoryName || "N/A",
    },
    {
      key: "unitCapacity",
      label: t("Unit/Capacity"),
      render: (_value, row) =>
        row.Product?.unit && row.Product?.capacity != null
          ? `${row.Product.capacity} ${row.Product.unit}`
          : row.unit || "-",
    },
    {
      key: "quantity",
      label: t("Quantity"),
      render: (value) => <div className="font-medium">{value}</div>,
    },
    {
      key: "status",
      label: t("Status"),
      type: "badge",
      render: (_value, row) => {
        const status = getStockStatus(row.quantity)
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    { key: "createdAt", label: t("Created"), type: "date" },
  ]

  const cardFields = [
    { key: "productName", primary: true, render: (_value, row) => row.Product?.productName || "N/A" },
    {
      key: "productCode",
      secondary: true,
      render: (_value, row) => row.Product?.productCode ?? "-",
    },
    { key: "branchName", label: t("Branch"), render: (_value, row) => row.Branch?.branchName || "N/A" },
    {
      key: "categoryName",
      label: t("Category"),
      render: (_value, row) => row.Product?.Category?.categoryName || "N/A",
    },
    {
      key: "unitCapacity",
      label: t("Unit/Capacity"),
      render: (_value, row) =>
        row.Product?.unit && row.Product?.capacity != null
          ? `${row.Product.capacity} ${row.Product.unit}`
          : row.unit || "-",
    },
    {
      key: "quantity",
      label: t("Quantity"),
      render: (value) => <div className="font-medium">{value}</div>,
    },
    {
      key: "status",
      label: t("Status"),
      type: "badge",
      render: (_value, row) => {
        const status = getStockStatus(row.quantity)
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    { key: "createdAt", label: t("Created"), type: "date" },
  ]

  const productOptions = products.map((p) => ({
    value: String(p.productId),
    label: `${p.productName}${p.productCode ? ` (${p.productCode})` : ""}`,
  }))

  const branchOptions = branches.map((b) => ({
    value: String(b.branchId),
    label: b.branchName,
  }))

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { variant: "destructive", label: t("Out of Stock") }
    if (quantity < 5) return { variant: "destructive", label: t("Critical") }
    if (quantity < 50) return { variant: "secondary", label: t("Low Stock") }
    return { variant: "default", label: t("In Stock") }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { data } = getSubmissionData()
      if (!data.productId) throw new Error(t("Product is required"))
      if (!data.branchId) throw new Error(t("Branch is required"))
      if (data.quantity <= 0) throw new Error(t("Quantity must be positive"))
      if (!data.unit) throw new Error(t("Unit is required"))

      let result
      if (editingStock) {
        result = await updateStock(editingStock.stockId, data)
      } else {
        result = await createEntryAndUpdateStock(data)
      }

      if (!result.success) {
        throw new Error(result.error || t("Stock operation failed"))
      }

      toast({
        title: t("Success"),
        description: t(`Stock entry ${editingStock ? "updated" : "created"} successfully`),
      })

      setIsDialogOpen(false)
      setEditingStock(null)
      resetForm()
      await fetch({ search: searchTerm, lowStock: showLowStock })
    } catch (err) {
      console.error("Stock operation error:", err)
      toast({
        title: t("Error"),
        description: err.message || t("An error occurred"),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (stock) => {
    if (!canUpdate) return
    setFormData({
      productId: String(stock.productId) || "",
      branchId: String(stock.branchId) || "",
      quantity: stock.quantity || 0,
      unit: stock.unit || "unit",
      memo: stock.memo || "",
      entryPrice: 0,
      invoice: "",
      entryDate: new Date().toISOString(),
      supplierId: null,
      status: "active",
    })
    setEditingStock(stock)
    setIsDialogOpen(true)
  }

  const handleDelete = async (stockId) => {
    if (!canDelete) return
    if (!confirm(t("Are you sure you want to delete this stock entry?"))) return

    try {
      const result = await deleteStock(stockId)
      if (!result.success) {
        throw new Error(result.error || t("Failed to delete stock entry"))
      }
      toast({
        title: t("Success"),
        description: t("Stock entry deleted successfully"),
      })
      await fetch({ search: searchTerm, lowStock: showLowStock })
    } catch (error) {
      console.error("Stock deletion error:", error)
      toast({
        title: t("Error"),
        description: error.message || t("Failed to delete stock entry"),
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    fetch({ search: searchTerm, lowStock: showLowStock })
    fetchProducts()
    fetchBranches()
  }

  const handleDialogClose = (open) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingStock(null)
      resetForm()
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Inventory")}</h1>
          <p className="text-muted-foreground">{t("Monitor stock levels and manage inventory entries")}</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button
              variant="outline"
              onClick={handleRetry}
              disabled={isLoading || prodLoading || branchLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading || prodLoading || branchLoading ? "animate-spin" : ""}`} />
              {t("Refresh")}
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button disabled={isLoading || prodLoading || branchLoading || !canCreate || products.length === 0 || branches.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Stock Entry")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingStock ? t("Edit Stock Entry") : t("Add Stock Entry")}</DialogTitle>
                <DialogDescription>
                  {editingStock ? t("Update inventory entry details") : t("Record new inventory entry")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormComboBox
                    name="productId"
                    label={t("Product")}
                    items={productOptions}
                    onCallbackSelect={(value) => handleChange("productId", value)}
                    value={formData.productId}
                    required
                    disabled={isSaving || prodLoading}
                  />
                  <FormComboBox
                    name="branchId"
                    label={t("Branch")}
                    items={branchOptions}
                    onCallbackSelect={(value) => handleChange("branchId", value)}
                    value={formData.branchId}
                    required
                    disabled={isSaving || branchLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    name="quantity"
                    label={t("Quantity")}
                    value={formData.quantity}
                    placeholder={t("Quantity")}
                    onCallbackInput={(name, value) => handleChange(name, parseInt(value) || 0)}
                    type="number"
                    min="1"
                    required
                    disabled={isSaving}
                  />
                  <FormInput
                    name="unit"
                    label={t("Unit")}
                    value={formData.unit}
                    placeholder={t("Unit")}
                    onCallbackInput={handleChange}
                    required
                    disabled={isSaving}
                  />
                </div>
                {!editingStock && (
                  <FormInput
                    name="entryPrice"
                    label={t("Entry Price")}
                    value={formData.entryPrice}
                    placeholder={t("Entry Price")}
                    onCallbackInput={(name, value) => handleChange(name, parseFloat(value) || 0)}
                    type="number"
                    step="0.01"
                    disabled={isSaving}
                  />
                )}
                <FormTextArea
                  name="memo"
                  label={t("Notes")}
                  value={formData.memo}
                  placeholder={t("Notes")}
                  onCallbackInput={handleChange}
                  rows={3}
                  disabled={isSaving}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSaving}>
                    {t("Cancel")}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingStock ? t("Updating...") : t("Creating...")}
                      </>
                    ) : editingStock ? (
                      t("Update Entry")
                    ) : (
                      t("Add Entry")
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">{t("Error loading data")}</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={handleRetry} disabled={isLoading || prodLoading || branchLoading}>
                {t("Try Again")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Total Entries")}</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStocks.length}</div>
              <p className="text-xs text-muted-foreground">{t("Stock entries in inventory")}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Low Stock")}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockCount}</div>
              <p className="text-xs text-muted-foreground">{t("Entries below 50 units")}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Total Quantity")}</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuantity}</div>
              <p className="text-xs text-muted-foreground">{t("Total units in inventory")}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                {t("Stock Levels")}
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredStocks.length} {t("stock entries in inventory")}</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                placeholder={t("Search inventory...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading || prodLoading || branchLoading}
              />
            </div>
            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
              disabled={isLoading || prodLoading || branchLoading}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {showLowStock ? t("Show All") : t("Low Stock Only")}
            </Button>
          </div>
          {view === "card" ? (
            <DataCards
              data={filteredStocks}
              fields={cardFields}
              loading={isLoading || prodLoading || branchLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="stockId"
              nameField="Product.productName"
              columns={4}
            />
          ) : (
            <DataTable
              data={filteredStocks}
              columns={tableColumns}
              loading={isLoading || prodLoading || branchLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="stockId"
              nameField="Product.productName"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}



// "use client"
// export const dynamic = "force-dynamic"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Plus, Search, Warehouse, AlertTriangle, Package, Edit, Trash2, Loader2, RefreshCw } from "lucide-react"
// import { useTranslation } from "react-i18next"
// import { useFormHandler } from "@/hooks/use-form"
// import { useStockStore } from "@/stores/stock-store"
// import { useProductStore } from "@/stores/product-store"
// import { useBranchStore } from "@/stores/branch-store"
// import { FormInput, FormTextArea, FormComboBox } from "@/components/form"
// import { usePermissions } from "@/hooks/use-permissions"
// import { toast } from "sonner"
// import { DataTable } from "@/components/ui/data-table"
// import { formatDate } from "@/lib/utils"

// export default function InventoryPage() {
//   const { t } = useTranslation("ui")
//   const { canCreate, canUpdate, canDelete } = usePermissions()
//   const {
//     items: stockEntries,
//     isLoading: stockLoading,
//     error: stockError,
//     fetch: fetchStocks,
//     create: createStock,
//     update: updateStock,
//     delete: deleteStock,
//   } = useStockStore()
//   const {
//     items: products,
//     isLoading: prodLoading,
//     fetch: fetchProducts,
//   } = useProductStore()
//   const {
//     items: branches,
//     isLoading: branchLoading,
//     fetch: fetchBranches,
//   } = useBranchStore()

//   const [searchTerm, setSearchTerm] = useState("")
//   const [showLowStock, setShowLowStock] = useState(false)
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [editingStock, setEditingStock] = useState(null)
//   const [formError, setFormError] = useState(null)

//   const { formData, resetForm, setFormData, handleChange, getSubmissionData } = useFormHandler({
//     productId: "",
//     branchId: "",
//     quantity: 0,
//     unit: "unit",
//     memo: "",
//   })

//   useEffect(() => {
//     const loadData = async () => {
//       await Promise.all([
//         fetchStocks({ search: searchTerm, lowStock: showLowStock }),
//         fetchProducts(),
//         fetchBranches(),
//       ])
//       console.log("Loaded products:", products)
//       console.log("Loaded branches:", branches)
//     }
//     loadData()
//   }, [fetchStocks, fetchProducts, fetchBranches, searchTerm, showLowStock])

//   useEffect(() => {
//     console.log("Form data updated:", formData)
//   }, [formData])

//   const filteredStocks = stockEntries.filter(
//     (stock) =>
//       stock.Product?.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stock.Product?.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stock.memo?.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setFormError(null)
//     const isEditing = !!editingStock

//     console.log("Form submission data:", formData)
//     console.log("Submission payload:", getSubmissionData())

//     if (!isEditing && !canCreate) {
//       toast({
//         title: t("Permission Denied"),
//         description: t("You do not have permission to create stock entries"),
//         variant: "destructive",
//       })
//       return
//     }
//     if (isEditing && !canUpdate) {
//       toast({
//         title: t("Permission Denied"),
//         description: t("You do not have permission to update stock entries"),
//         variant: "destructive",
//       })
//       return
//     }

//     try {
//       const { data } = getSubmissionData()
//       console.log("Validated data:", data)
//       if (!data.productId) throw new Error(t("Product is required"))
//       if (!data.branchId) throw new Error(t("Branch is required"))
//       if (data.quantity <= 0) throw new Error(t("Quantity must be positive"))
//       if (!data.unit) throw new Error(t("Unit is required"))

//       const success = isEditing
//         ? await updateStock(editingStock.stockId, data)
//         : await createStock(data)

//       if (!success) {
//         throw new Error(t(`Failed to ${isEditing ? "update" : "create"} stock entry`))
//       }

//       toast({
//         title: t("Success"),
//         description: t(`Stock entry ${isEditing ? "updated" : "created"} successfully`),
//       })
//       setIsDialogOpen(false)
//       setEditingStock(null)
//       resetForm()
//       await fetchStocks({ search: searchTerm, lowStock: showLowStock })
//     } catch (error) {
//       console.error("Stock operation error:", error)
//       setFormError(error.message || t("An error occurred"))
//       toast({
//         title: t("Error"),
//         description: error.message || t(`Failed to ${isEditing ? "update" : "create"} stock entry`),
//         variant: "destructive",
//       })
//     }
//   }

//   const handleEdit = (stock) => {
//     if (!canUpdate) return
//     const newFormData = {
//       productId: String(stock.productId) || "",
//       branchId: String(stock.branchId) || "",
//       quantity: stock.quantity || 0,
//       unit: stock.unit || "unit",
//       memo: stock.memo || "",
//     }
//     console.log("Setting formData for edit:", newFormData)
//     setFormData(newFormData)
//     setEditingStock(stock)
//     setIsDialogOpen(true)
//     console.log("Editing stock:", stock)
//   }

//   const handleDelete = async (stockId) => {
//     if (!canDelete) return
//     if (!confirm(t("Are you sure you want to delete this stock entry?"))) return

//     try {
//       const success = await deleteStock(stockId)
//       if (!success) {
//         throw new Error(t("Failed to delete stock entry"))
//       }
//       toast({
//         title: t("Success"),
//         description: t("Stock entry deleted successfully"),
//       })
//       await fetchStocks({ search: searchTerm, lowStock: showLowStock })
//     } catch (error) {
//       console.error("Stock deletion error:", error)
//       toast({
//         title: t("Error"),
//         description: error.message || t("Failed to delete stock entry"),
//         variant: "destructive",
//       })
//     }
//   }

//   const handleRetry = () => {
//     fetchStocks({ search: searchTerm, lowStock: showLowStock })
//     fetchProducts()
//     fetchBranches()
//   }

//   const handleDialogClose = (open) => {
//     setIsDialogOpen(open)
//     if (!open) {
//       setEditingStock(null)
//       resetForm()
//       setFormError(null)
//     }
//   }

//   const getStockStatus = (quantity) => {
//     if (quantity === 0) return { variant: "destructive", label: t("Out of Stock") }
//     if (quantity < 5) return { variant: "destructive", label: t("Critical") }
//     if (quantity < 50) return { variant: "secondary", label: t("Low Stock") }
//     return { variant: "default", label: t("In Stock") }
//   }

//   const lowStockCount = filteredStocks.filter((stock) => stock.quantity < 50).length
//   const outOfStockCount = filteredStocks.filter((stock) => stock.quantity === 0).length
//   const totalQuantity = filteredStocks.reduce((sum, stock) => sum + stock.quantity, 0)

//   const tableColumns = [
//     {
//       key: "product",
//       label: t("Product"),
//       render: (_value, row) => (
//         <div>
//           <div className="font-medium">{row.Product?.productName || "N/A"}</div>
//           {row.Product?.productCode && (
//             <div className="text-sm text-muted-foreground">{row.Product.productCode}</div>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "branch",
//       label: t("Branch"),
//       render: (_value, row) => row.Branch?.branchName || "N/A",
//     },
//     {
//       key: "category",
//       label: t("Category"),
//       render: (_value, row) => row.Product?.Category?.categoryName || "N/A",
//     },
//     {
//       key: "unitCapacity",
//       label: t("Unit/Capacity"),
//       render: (_value, row) =>
//         row.Product?.unit && row.Product?.capacity != null
//           ? `${row.Product.capacity} ${row.Product.unit}`
//           : row.unit || "-",
//     },
//     {
//       key: "quantity",
//       label: t("Quantity"),
//       render: (value) => <div className="font-medium">{value}</div>,
//     },
//     {
//       key: "status",
//       label: t("Status"),
//       render: (_value, row) => {
//         const status = getStockStatus(row.quantity)
//         return <Badge variant={status.variant}>{status.label}</Badge>
//       },
//     },
//     {
//       key: "createdAt",
//       label: t("Created"),
//       render: (value) => formatDate(value),
//     },
//   ]

//   const productOptions = products.map((p) => ({
//     time: String(p.productId),
//     less: `${p.productName}${p.productCode ? ` (${p.productCode})` : ""}`,
//   }))

//   const branchOptions = branches.map((b) => ({
//     time: String(b.branchId),
//     less: b.branchName,
//   }))

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">{t("Inventory")}</h1>
//           <p className="text-muted-foreground">{t("Monitor stock levels and manage inventory entries")}</p>
//         </div>
//         <div className="flex gap-2">
//           {canCreate && (
//             <Button
//               variant="outline"
//               onClick={handleRetry}
//               disabled={stockLoading || prodLoading || branchLoading}
//             >
//               <RefreshCw className={`mr-2 h-4 w-4 ${stockLoading || prodLoading || branchLoading ? "animate-spin" : ""}`} />
//               {t("Refresh")}
//             </Button>
//           )}
//           <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
//             <DialogTrigger asChild>
//               <Button disabled={stockLoading || prodLoading || branchLoading || !canCreate || products.length === 0 || branches.length === 0}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 {t("Add Stock Entry")}
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[600px]">
//               <DialogHeader>
//                 <DialogTitle>{editingStock ? t("Edit Stock Entry") : t("Add Stock Entry")}</DialogTitle>
//                 <DialogDescription>
//                   {editingStock ? t("Update inventory entry details") : t("Record new inventory entry")}
//                 </DialogDescription>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 {formError && <p className="text-red-500 text-sm">{formError}</p>}
//                 <div className="grid grid-cols-2 gap-4">
//                   <FormComboBox
//                     name="productId"
//                     label={t("Product")}
//                     item={productOptions}
//                     optID="time"
//                     optLabel="less"
//                     onCallbackSelect={(value) => {
//                       console.log("Selected productId:", value)
//                       handleChange("productId", value)
//                     }}
//                     value={formData.productId}
//                     required
//                     error={formError && !formData.productId ? t("Product is required") : null}
//                     disabled={stockLoading || prodLoading}
//                   />
//                   <FormComboBox
//                     name="branchId"
//                     label={t("Branch")}
//                     item={branchOptions}
//                     optID="time"
//                     optLabel="less"
//                     onCallbackSelect={(value) => {
//                       console.log("Selected branchId:", value)
//                       handleChange("branchId", value)
//                     }}
//                     value={formData.branchId}
//                     required
//                     error={formError && !formData.branchId ? t("Branch is required") : null}
//                     disabled={stockLoading || branchLoading}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <FormInput
//                     name="quantity"
//                     label={t("Quantity")}
//                     value={formData.quantity}
//                     placeholder={t("Quantity")}
//                     onCallbackInput={(name, value) => handleChange(name, parseInt(value) || 0)}
//                     type="number"
//                     min="1"
//                     required
//                     error={formError && formData.quantity <= 0 ? t("Quantity must be positive") : null}
//                   />
//                   <FormInput
//                     name="unit"
//                     label={t("Unit")}
//                     value={formData.unit}
//                     placeholder={t("Unit")}
//                     onCallbackInput={handleChange}
//                     required
//                     error={formError && !formData.unit ? t("Unit is required") : null}
//                   />
//                 </div>
//                 <FormTextArea
//                   name="memo"
//                   label={t("Notes")}
//                   value={formData.memo}
//                   placeholder={t("Notes")}
//                   onCallbackInput={handleChange}
//                   rows={3}
//                 />
//                 <div className="flex justify-end gap-2">
//                   <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
//                     {t("Cancel")}
//                   </Button>
//                   <Button type="submit">
//                     {editingStock ? t("Update Entry") : t("Add Entry")}
//                   </Button>
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </motion.div>

//       {(stockError || prodLoading || branchLoading) && (
//         <Card className="border-destructive">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-destructive font-medium">{t("Error loading data")}</p>
//                 <p className="text-sm text-muted-foreground">{stockError || t("Loading products or branches")}</p>
//               </div>
//               <Button variant="outline" onClick={handleRetry} disabled={stockLoading || prodLoading || branchLoading}>
//                 {t("Try Again")}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <div className="grid gap-4 md:grid-cols-3">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">{t("Total Entries")}</CardTitle>
//               <Package className="h-4 w-4 text-blue-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{filteredStocks.length}</div>
//               <p className="text-xs text-muted-foreground">{t("Stock entries in inventory")}</p>
//             </CardContent>
//           </Card>
//         </motion.div>
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">{t("Low Stock")}</CardTitle>
//               <AlertTriangle className="h-4 w-4 text-orange-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{lowStockCount}</div>
//               <p className="text-xs text-muted-foreground">{t("Entries below 50 units")}</p>
//             </CardContent>
//           </Card>
//         </motion.div>
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">{t("Total Quantity")}</CardTitle>
//               <Package className="h-4 w-4 text-green-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{totalQuantity}</div>
//               <p className="text-xs text-muted-foreground">{t("Total units in inventory")}</p>
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Warehouse className="h-5 w-5" />
//             {t("Stock Levels")}
//             {stockLoading && <Loader2 className="h-4 w-4 animate-spin" />}
//           </CardTitle>
//           <CardDescription>
//             {filteredStocks.length} {t("stock entries in inventory")}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
//               />
//               <Input
//                 placeholder={t("Search inventory...")}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//                 disabled={stockLoading || prodLoading || branchLoading}
//               />
//             </div>
//             <Button
//               variant={showLowStock ? "default" : "outline"}
//               onClick={() => setShowLowStock(!showLowStock)}
//               disabled={stockLoading || prodLoading || branchLoading}
//             >
//               <AlertTriangle className="mr-2 h-4 w-4" />
//               {showLowStock ? t("Show All") : t("Low Stock Only")}
//             </Button>
//           </div>
//           <DataTable
//             data={filteredStocks}
//             columns={tableColumns}
//             loading={stockLoading || prodLoading || branchLoading}
//             onEdit={handleEdit}
//             onDelete={handleDelete}
//             idField="stockId"
//             nameField="Product.productName"
//           />
//         </CardContent>
//       </Card>
//     </div>
//   )
// }





