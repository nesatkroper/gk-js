"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Warehouse, AlertTriangle, Package, Edit, Trash2, Loader2, RefreshCw } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useFormHandler } from "@/hooks/use-form"
import { useStockStore } from "@/stores/stock-store"
import { useProductStore } from "@/stores/product-store"
import { useBranchStore } from "@/stores/branch-store"
import { FormInput, FormTextArea, FormComboBox } from "@/components/form"
import { usePermissions } from "@/hooks/use-permissions"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { formatDate } from "@/lib/utils"

export default function InventoryPage() {
  const { t } = useTranslation("ui")
  const { canCreate, canUpdate, canDelete } = usePermissions()
  const {
    items: stockEntries,
    isLoading: stockLoading,
    error: stockError,
    fetch: fetchStocks,
    create: createStock,
    update: updateStock,
    delete: deleteStock,
  } = useStockStore()
  const {
    items: products,
    isLoading: prodLoading,
    fetch: fetchProducts,
  } = useProductStore()
  const {
    items: branches,
    isLoading: branchLoading,
    fetch: fetchBranches,
  } = useBranchStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [showLowStock, setShowLowStock] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStock, setEditingStock] = useState(null)
  const [formError, setFormError] = useState(null)

  const { formData, resetForm, setFormData, handleChange, getSubmissionData } = useFormHandler({
    productId: "",
    branchId: "",
    quantity: 0,
    unit: "unit",
    memo: "",
  })

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchStocks({ search: searchTerm, lowStock: showLowStock }),
        fetchProducts(),
        fetchBranches(),
      ])
    }
    loadData()
  }, [fetchStocks, fetchProducts, fetchBranches, searchTerm, showLowStock])

  const filteredStocks = stockEntries.filter(
    (stock) =>
      stock.Product?.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.Product?.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.memo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    const isEditing = !!editingStock

    if (!isEditing && !canCreate) {
      toast({
        title: t("Permission Denied"),
        description: t("You do not have permission to create stock entries"),
        variant: "destructive",
      })
      return
    }
    if (isEditing && !canUpdate) {
      toast({
        title: t("Permission Denied"),
        description: t("You do not have permission to update stock entries"),
        variant: "destructive",
      })
      return
    }

    try {
      const { data } = getSubmissionData()
      if (!data.productId) throw new Error(t("Product is required"))
      if (!data.branchId) throw new Error(t("Branch is required"))
      if (data.quantity <= 0) throw new Error(t("Quantity must be positive"))
      if (!data.unit) throw new Error(t("Unit is required"))

      const success = isEditing
        ? await updateStock(editingStock.stockId, data)
        : await createStock(data)

      if (!success) {
        throw new Error(t(`Failed to ${isEditing ? "update" : "create"} stock entry`))
      }

      toast({
        title: t("Success"),
        description: t(`Stock entry ${isEditing ? "updated" : "created"} successfully`),
      })
      setIsDialogOpen(false)
      setEditingStock(null)
      resetForm()
      await fetchStocks({ search: searchTerm, lowStock: showLowStock })
    } catch (error) {
      console.error("Stock operation error:", error)
      setFormError(error.message || t("An error occurred"))
      toast({
        title: t("Error"),
        description: error.message || t(`Failed to ${isEditing ? "update" : "create"} stock entry`),
        variant: "destructive",
      })
    }
  }

  const handleEdit = (stock) => {
    if (!canUpdate) return
    setFormData({
      productId: stock.productId || "",
      branchId: stock.branchId || "",
      quantity: stock.quantity || 0,
      unit: stock.unit || "unit",
      memo: stock.memo || "",
    })
    setEditingStock(stock)
    setIsDialogOpen(true)
  }

  const handleDelete = async (stockId) => {
    if (!canDelete) return
    if (!confirm(t("Are you sure you want to delete this stock entry?"))) return

    try {
      const success = await deleteStock(stockId)
      if (!success) {
        throw new Error(t("Failed to delete stock entry"))
      }
      toast({
        title: t("Success"),
        description: t("Stock entry deleted successfully"),
      })
      await fetchStocks({ search: searchTerm, lowStock: showLowStock })
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
    fetchStocks({ search: searchTerm, lowStock: showLowStock })
    fetchProducts()
    fetchBranches()
  }

  const handleDialogClose = (open) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingStock(null)
      resetForm()
      setFormError(null)
    }
  }

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { variant: "destructive", label: t("Out of Stock") }
    if (quantity < 5) return { variant: "destructive", label: t("Critical") }
    if (quantity < 50) return { variant: "secondary", label: t("Low Stock") }
    return { variant: "default", label: t("In Stock") }
  }

  const lowStockCount = filteredStocks.filter((stock) => stock.quantity < 50).length
  const outOfStockCount = filteredStocks.filter((stock) => stock.quantity === 0).length
  const totalQuantity = filteredStocks.reduce((sum, stock) => sum + stock.quantity, 0)

  const tableColumns = [
    {
      key: "product",
      label: t("Product"),
      render: (_value, row) => (
        <div>
          <div className="font-medium">{row.Product?.productName || "N/A"}</div>
          {row.Product?.productCode && (
            <div className="text-sm text-muted-foreground">{row.Product.productCode}</div>
          )}
        </div>
      ),
    },
    {
      key: "branch",
      label: t("Branch"),
      render: (_value, row) => row.Branch?.branchName || "N/A",
    },
    {
      key: "category",
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
      render: (_value, row) => {
        const status = getStockStatus(row.quantity)
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    {
      key: "createdAt",
      label: t("Created"),
      render: (value) => formatDate(value),
    },
  ]

  const productOptions = products.map((p) => ({
    time: p.productId,
    less: `${p.productName}${p.productCode ? ` (${p.productCode})` : ""}`,
  }))

  const branchOptions = branches.map((b) => ({
    time: b.branchId,
    less: b.branchName,
  }))

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
              disabled={stockLoading || prodLoading || branchLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${stockLoading || prodLoading || branchLoading ? "animate-spin" : ""}`} />
              {t("Refresh")}
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button disabled={stockLoading || prodLoading || branchLoading || !canCreate || products.length === 0 || branches.length === 0}>
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
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="grid grid-cols-2 gap-4">
                  <FormComboBox
                    name="productId"
                    label={t("Product")}
                    item={productOptions}
                    optID="time"
                    optLabel="less"
                    onCallbackSelect={(value) => handleChange("productId", value)}
                    defaultValue={formData.productId}
                    required
                    error={formError && !formData.productId ? t("Product is required") : null}
                    disabled={stockLoading || prodLoading}
                  />
                  <FormComboBox
                    name="branchId"
                    label={t("Branch")}
                    item={branchOptions}
                    optID="time"
                    optLabel="less"
                    onCallbackSelect={(value) => handleChange("branchId", value)}
                    defaultValue={formData.branchId}
                    required
                    error={formError && !formData.branchId ? t("Branch is required") : null}
                    disabled={stockLoading || branchLoading}
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
                    error={formError && formData.quantity <= 0 ? t("Quantity must be positive") : null}
                  />
                  <FormInput
                    name="unit"
                    label={t("Unit")}
                    value={formData.unit}
                    placeholder={t("Unit")}
                    onCallbackInput={handleChange}
                    required
                    error={formError && !formData.unit ? t("Unit is required") : null}
                  />
                </div>
                <FormTextArea
                  name="memo"
                  label={t("Notes")}
                  value={formData.memo}
                  placeholder={t("Notes")}
                  onCallbackInput={handleChange}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                    {t("Cancel")}
                  </Button>
                  <Button type="submit">
                    {editingStock ? t("Update Entry") : t("Add Entry")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {(stockError || prodLoading || branchLoading) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">{t("Error loading data")}</p>
                <p className="text-sm text-muted-foreground">{stockError || t("Loading products or branches")}</p>
              </div>
              <Button variant="outline" onClick={handleRetry} disabled={stockLoading || prodLoading || branchLoading}>
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
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            {t("Stock Levels")}
            {stockLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            {filteredStocks.length} {t("stock entries in inventory")}
          </CardDescription>
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
                disabled={stockLoading || prodLoading || branchLoading}
              />
            </div>
            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
              disabled={stockLoading || prodLoading || branchLoading}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {showLowStock ? t("Show All") : t("Low Stock Only")}
            </Button>
          </div>
          <DataTable
            data={filteredStocks}
            columns={tableColumns}
            loading={stockLoading || prodLoading || branchLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            idField="stockId"
            nameField="Product.productName"
          />
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
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Label } from "@/components/ui/label"
// import { DatePicker } from "@/components/ui/date-picker"
// import { Textarea } from "@/components/ui/textarea"
// import { Plus, Search, Warehouse, AlertTriangle, TrendingUp, Package, Edit, Trash2, Loader2 } from "lucide-react"
// import { useToast } from "@/components/ui/use-toast"
// import { useTranslation } from "react-i18next"
// import { useRouter } from "next/navigation"
// import { formatDate } from "@/lib/utils"
// import { useStockStore, useProductStore, useSupplierStore } from "@/stores"
// import { usePermissions } from "@/hooks/use-permissions"
// import { Combobox } from "@/components/ui/combobox"

// export default function InventoryPage() {
//   const { t } = useTranslation("ui")
//   const { items: stockEntries, isLoading, error, fetch, create, update, delete: deleteEntry } = useStockStore()
//   const { items: products, isLoading: prodLoading, fetch: proFetch } = useProductStore()
//   const { items: suppliers, isLoading: supLoading, fetch: supFetch } = useSupplierStore()
//   const { canCreate, canUpdate, canDelete } = usePermissions()

//   const router = useRouter()
//   const { toast } = useToast()
//   const [searchTerm, setSearchTerm] = useState("")
//   const [showLowStock, setShowLowStock] = useState(false)
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
//   const [selectedEntry, setSelectedEntry] = useState(null)
//   const [entryDate, setEntryDate] = useState(new Date())
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [selectedProductId, setSelectedProductId] = useState(null)
//   const [selectedSupplierId, setSelectedSupplierId] = useState(null)

//   useEffect(() => {
//     fetch({ search: searchTerm, lowStock: showLowStock })
//     proFetch()
//     supFetch()
//   }, [fetch, proFetch, supFetch, searchTerm, showLowStock])

//   // console.log(suppliers)

//   const filteredStocks = stockEntries.filter(
//     (stock) =>
//       stock.Product?.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stock.Product?.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stock.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stock.memo?.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   async function handleAddStock(formData) {
//     if (!canCreate) {
//       toast({
//         title: t("Permission Denied"),
//         description: t("You do not have permission to create stock entries"),
//         variant: "destructive",
//       })
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       const stockData = {
//         productId: formData.get("productId"),
//         supplierId: formData.get("supplierId"),
//         quantity: parseInt(formData.get("quantity")),
//         entryPrice: parseFloat(formData.get("entryPrice")),
//         entryDate: entryDate?.toISOString(),
//         invoice: formData.get("invoice") || null,
//         memo: formData.get("memo") || null,
//         status: formData.get("status") || "active", // Default to active if not provided
//       }

//       if (!stockData.productId) throw new Error(t("Product is required"))
//       if (!stockData.supplierId) throw new Error(t("Supplier is required"))
//       if (stockData.quantity <= 0) throw new Error(t("Quantity must be positive"))
//       if (stockData.entryPrice < 0) throw new Error(t("Entry price must be non-negative"))

//       const success = await create(stockData)
//       if (success) {
//         toast({
//           title: t("Success"),
//           description: t("Stock entry created successfully"),
//         })
//         setIsAddDialogOpen(false)
//         setSelectedProductId(null)
//         setSelectedSupplierId(null)
//         setEntryDate(new Date())
//         router.refresh()
//       } else {
//         throw new Error(t("Failed to create stock entry"))
//       }
//     } catch (error) {
//       toast({
//         title: t("Error"),
//         description: error.message || t("Failed to create stock entry"),
//         variant: "destructive",
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   async function handleEditStock(formData) {
//     if (!canUpdate) {
//       toast({
//         title: t("Permission Denied"),
//         description: t("You do not have permission to update stock entries"),
//         variant: "destructive",
//       })
//       return
//     }

//     if (!selectedEntry) return

//     setIsSubmitting(true)

//     try {
//       const stockData = {
//         productId: formData.get("productId"),
//         supplierId: formData.get("supplierId"),
//         quantity: parseInt(formData.get("quantity")),
//         entryPrice: parseFloat(formData.get("entryPrice")),
//         entryDate: entryDate?.toISOString(),
//         invoice: formData.get("invoice") || null,
//         memo: formData.get("memo") || null,
//         status: formData.get("status"),
//       }

//       if (!stockData.productId) throw new Error(t("Product is required"))
//       if (!stockData.supplierId) throw new Error(t("Supplier is required"))
//       if (stockData.quantity <= 0) throw new Error(t("Quantity must be positive"))
//       if (stockData.entryPrice < 0) throw new Error(t("Entry price must be non-negative"))

//       const success = await update(selectedEntry.entryId, stockData)
//       if (success) {
//         toast({
//           title: t("Success"),
//           description: t("Stock entry updated successfully"),
//         })
//         setIsEditDialogOpen(false)
//         setSelectedEntry(null)
//         setEntryDate(new Date())
//         router.refresh()
//       } else {
//         throw new Error(t("Failed to update stock entry"))
//       }
//     } catch (error) {
//       toast({
//         title: t("Error"),
//         description: error.message || t("Failed to update stock entry"),
//         variant: "destructive",
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleDeleteStock = async (entryId) => {
//     if (!canDelete) {
//       toast({
//         title: t("Permission Denied"),
//         description: t("You do not have permission to delete stock entries"),
//         variant: "destructive",
//       })
//       return
//     }

//     if (!confirm(t("Are you sure you want to delete this stock entry?"))) return

//     try {
//       const success = await deleteEntry(entryId)
//       if (success) {
//         toast({
//           title: t("Success"),
//           description: t("Stock entry deleted successfully"),
//         })
//       } else {
//         throw new Error(t("Failed to delete stock entry"))
//       }
//     } catch (error) {
//       toast({
//         title: t("Error"),
//         description: error.message || t("Failed to delete stock entry"),
//         variant: "destructive",
//       })
//     }
//   }

//   const getStockStatus = (quantity) => {
//     if (quantity === 0) return { variant: "destructive", label: t("Out of Stock") }
//     if (quantity < 5) return { variant: "destructive", label: t("Critical") }
//     if (quantity < 50) return { variant: "secondary", label: t("Low Stock") }
//     return { variant: "default", label: t("In Stock") }
//   }

//   const lowStockCount = stockEntries.filter((stock) => stock.quantity < 50).length
//   const outOfStockCount = stockEntries.filter((stock) => stock.quantity === 0).length
//   const totalValue = stockEntries
//     .reduce((sum, stock) => sum + stock.quantity * stock.entryPrice, 0)
//     .toFixed(2)

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

//         {canCreate && (
//           <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//             <DialogTrigger asChild>
//               <Button disabled={prodLoading || supLoading || products.length === 0 || suppliers === 0}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 {t("Add Stock Entry")}
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[600px]">
//               <DialogHeader>
//                 <DialogTitle>{t("Add Stock Entry")}</DialogTitle>
//                 <DialogDescription>{t("Record new inventory received from supplier")}</DialogDescription>
//               </DialogHeader>
//               <form action={handleAddStock} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="productId">{t("Product")} *</Label>
//                     <Combobox
//                       id="productId"
//                       name="productId"
//                       options={products.map((p) => ({
//                         value: p.productId.toString(),
//                         label: `${p.productName}${p.productCode ? ` (${p.productCode})` : ""}`,
//                       }))}
//                       placeholder={t("Select product...")}
//                       value={selectedProductId ? selectedProductId.toString() : ""}
//                       onChange={(value) => setSelectedProductId(value ? Number(value) : null)}
//                       disabled={isSubmitting}
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="supplierId">{t("Supplier")} *</Label>
//                     <Combobox
//                       id="supplierId"
//                       name="supplierId"
//                       options={suppliers.map((s) => ({
//                         value: s.supplierId.toString(),
//                         label: `${s.supplierName}${s.companyName ? ` (${s.companyName})` : ""}`,
//                       }))}
//                       placeholder={t("Select supplier...")}
//                       value={selectedSupplierId ? selectedSupplierId.toString() : ""}
//                       onChange={(value) => setSelectedSupplierId(value ? Number(value) : null)}
//                       disabled={isSubmitting}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="quantity">{t("Quantity")} *</Label>
//                     <Input
//                       id="quantity"
//                       name="quantity"
//                       type="number"
//                       min="1"
//                       required
//                       disabled={isSubmitting}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="entryPrice">{t("Entry Price")} *</Label>
//                     <Input
//                       id="entryPrice"
//                       name="entryPrice"
//                       type="number"
//                       step="0.01"
//                       required
//                       disabled={isSubmitting}
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="entryDate">{t("Entry Date")}</Label>
//                     <DatePicker
//                       date={entryDate}
//                       onDateChange={setEntryDate}
//                       placeholder={t("Select entry date")}
//                       disabled={isSubmitting}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="invoice">{t("Invoice Number")}</Label>
//                     <Input id="invoice" name="invoice" disabled={isSubmitting} />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="memo">{t("Notes")}</Label>
//                   <Textarea id="memo" name="memo" rows={3} disabled={isSubmitting} />
//                 </div>

//                 <div className="flex justify-end gap-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => {
//                       setIsAddDialogOpen(false)
//                       setSelectedProductId(null)
//                       setSelectedSupplierId(null)
//                     }}
//                     disabled={isSubmitting}
//                   >
//                     {t("Cancel")}
//                   </Button>
//                   <Button type="submit" disabled={isSubmitting}>
//                     {isSubmitting ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         {t("Processing...")}
//                       </>
//                     ) : (
//                       t("Add Entry")
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         )}
//       </motion.div>

//       {(error || prodLoading || supLoading) && (
//         <Card className="border-destructive">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-destructive font-medium">{t("Error loading data")}</p>
//                 <p className="text-sm text-muted-foreground">{error || t("Loading products or suppliers")}</p>
//               </div>
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   fetch({ search: searchTerm, lowStock: showLowStock })
//                   proFetch()
//                   supFetch()
//                 }}
//                 disabled={isLoading || prodLoading || supLoading}
//               >
//                 {t("Try Again")}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <div className="grid gap-4 md:grid-cols-4">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">{t("Total Entries")}</CardTitle>
//               <Package className="h-4 w-4 text-blue-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stockEntries.length}</div>
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
//               <CardTitle className="text-sm font-medium">{t("Out of Stock")}</CardTitle>
//               <AlertTriangle className="h-4 w-4 text-red-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{outOfStockCount}</div>
//               <p className="text-xs text-muted-foreground">{t("Entries with 0 units")}</p>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">{t("Total Value")}</CardTitle>
//               <TrendingUp className="h-4 w-4 text-green-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">${totalValue}</div>
//               <p className="text-xs text-muted-foreground">{t("Estimated inventory value")}</p>
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Warehouse className="h-5 w-5" />
//             {t("Stock Levels")}
//             {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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
//                 disabled={isLoading || prodLoading || supLoading}
//               />
//             </div>
//             <Button
//               variant={showLowStock ? "default" : "outline"}
//               onClick={() => setShowLowStock(!showLowStock)}
//               disabled={isLoading || prodLoading || supLoading}
//             >
//               <AlertTriangle className="mr-2 h-4 w-4" />
//               {showLowStock ? t("Show All") : t("Low Stock Only")}
//             </Button>
//           </div>

//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>{t("Product")}</TableHead>
//                   <TableHead>{t("Supplier")}</TableHead>
//                   <TableHead>{t("Category")}</TableHead>
//                   <TableHead>{t("Unit/Capacity")}</TableHead>
//                   <TableHead>{t("Quantity")}</TableHead>
//                   <TableHead>{t("Status")}</TableHead>
//                   <TableHead>{t("Entry Date")}</TableHead>
//                   <TableHead className="text-right">{t("Actions")}</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredStocks.map((stock) => {
//                   const status = getStockStatus(stock.quantity)
//                   return (
//                     <motion.tr
//                       key={stock.entryId}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       className="group"
//                     >
//                       <TableCell>
//                         <div>
//                           <div className="font-medium">{stock.Product?.productName || "N/A"}</div>
//                           {stock.Product?.productCode && (
//                             <div className="text-sm text-muted-foreground">{stock.Product.productCode}</div>
//                           )}
//                         </div>
//                       </TableCell>
//                       <TableCell>{stock.Supplier?.supplierName || "N/A"}</TableCell>
//                       <TableCell>{stock.Product?.Category?.categoryName || "N/A"}</TableCell>
//                       <TableCell>
//                         {stock.Product?.unit && stock.Product?.capacity != null
//                           ? `${stock.Product.capacity} ${stock.Product.unit}`
//                           : stock.Product?.unit || stock.Product?.capacity || "-"}
//                       </TableCell>
//                       <TableCell>
//                         <div className="font-medium">{stock.quantity}</div>
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant={status.variant}>{status.label}</Badge>
//                       </TableCell>
//                       <TableCell>{formatDate(stock.entryDate || stock.createdAt)}</TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => {
//                               setSelectedEntry(stock)
//                               setEntryDate(stock.entryDate ? new Date(stock.entryDate) : new Date())
//                               setIsEditDialogOpen(true)
//                             }}
//                             disabled={!canUpdate}
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleDeleteStock(stock.entryId)}
//                             disabled={!canDelete}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </motion.tr>
//                   )
//                 })}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       <Dialog
//         open={isEditDialogOpen}
//         onOpenChange={(open) => {
//           setIsEditDialogOpen(open)
//           if (!open) {
//             setSelectedEntry(null)
//             setEntryDate(new Date())
//           }
//         }}
//       >
//         <DialogContent className="sm:max-w-[600px]">
//           <DialogHeader>
//             <DialogTitle>{t("Edit Stock Entry")}</DialogTitle>
//             <DialogDescription>{t("Update inventory entry details")}</DialogDescription>
//           </DialogHeader>
//           {selectedEntry && (
//             <form action={handleEditStock} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="productId">{t("Product")} *</Label>
//                 < combiner
//                   id="productId"
//                   name="productId"
//                   options={products.map((product) => ({
//                     value: product.productId.toString(),
//                     label: `${product.productName}${product.productCode ? ` (${product.productCode})` : ""}`,
//                   }))}
//                   placeholder={t("Select product...")}
//                   value={selectedEntry.productId ? selectedEntry.productId.toString() : ""}
//                   onChange={(value) => {
//                     setSelectedEntry({ ...selectedEntry, productId: value })
//                   }}
//                   disabled={isSubmitting}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="supplierId">{t("Supplier")} *</Label>
//                 <Combobox
//                   id="supplierId"
//                   name="supplierId"
//                   options={suppliers.map((supplier) => ({
//                     value: supplier.supplierId.toString(),
//                     label: `${supplier.supplierName}${supplier.companyName ? ` (${supplier.companyName})` : ""}`,
//                   }))}
//                   placeholder={t("Select supplier...")}
//                   value={selectedEntry.supplierId ? selectedEntry.supplierId.toString() : ""}
//                   onChange={(value) => {
//                     setSelectedEntry({ ...selectedEntry, supplierId: value })
//                   }}
//                   disabled={isSubmitting}
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="quantity">{t("Quantity")} *</Label>
//                   <Input
//                     id="quantity"
//                     name="quantity"
//                     type="number"
//                     min="1"
//                     defaultValue={selectedEntry.quantity}
//                     required
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="entryPrice">{t("Entry Price")} *</Label>
//                   <Input
//                     id="entryPrice"
//                     name="entryPrice"
//                     type="number"
//                     step="0.01"
//                     defaultValue={selectedEntry.entryPrice}
//                     required
//                     disabled={isSubmitting}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="entryDate">{t("Entry Date")}</Label>
//                   <DatePicker
//                     date={entryDate}
//                     onDateChange={setEntryDate}
//                     placeholder={t("Select entry date")}
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="invoice">{t("Invoice Number")}</Label>
//                   <Input
//                     id="invoice"
//                     name="invoice"
//                     defaultValue={selectedEntry.invoice || ""}
//                     disabled={isSubmitting}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="memo">{t("Notes")}</Label>
//                 <Textarea
//                   id="memo"
//                   name="memo"
//                   rows={3}
//                   defaultValue={selectedEntry.memo || ""}
//                   disabled={isSubmitting}
//                 />
//                 <Label htmlFor="status">{t("Status")}</Label>
//                 <Combobox
//                   id="status"
//                   name="status"
//                   options={[
//                     { value: "active", label: t("Active") },
//                     { value: "inactive", label: t("Inactive") },
//                   ]}
//                   placeholder={t("Select status...")}
//                   value={selectedEntry.status || ""}
//                   onChange={(value) => {
//                     setSelectedEntry({ ...selectedEntry, status: value })
//                   }}
//                   disabled={isSubmitting}
//                 />
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => {
//                     setIsEditDialogOpen(false)
//                     setSelectedEntry(null)
//                     setEntryDate(new Date())
//                   }}
//                   disabled={isSubmitting}
//                 >
//                   {t("Cancel")}
//                 </Button>
//                 <Button type="submit" disabled={isSubmitting}>
//                   {isSubmitting ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       {t("Updating...")}
//                     </>
//                   ) : (
//                     t("Update Entry")
//                   )}
//                 </Button>
//               </div>
//             </form>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }




