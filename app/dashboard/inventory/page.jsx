"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { useFormHandler } from "@/hooks/use-form"
import { useStockStore } from "@/stores/stock-store"
import { useProductStore } from "@/stores/product-store"
import { useBranchStore } from "@/stores/branch-store"
import { useSupplierStore } from "@/stores/supplier-store"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { ViewToggle } from "@/components/ui/view-toggle"
import { FormImagePreview, FormImageResize, FormInput, FormTextArea } from "@/components/form"
import { Combobox } from "@/components/ui/combobox"
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
import { Input } from "@/components/ui/input"

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
  const { items: suppliers, isLoading: supplierLoading, fetch: fetchSuppliers } = useSupplierStore()
  const { formData, resetForm, setFormData, handleChange, handleImageData, getSubmissionData } = useFormHandler({
    productId: "",
    branchId: "",
    quantity: 0,
    unit: "unit",
    memo: "N/A",
    entryPrice: 0,
    invoice: null,
    entryDate: new Date().toISOString(),
    supplierId: null,
    status: "active",
  })

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetch({ search: searchTerm, lowStock: showLowStock }),
        fetchProducts({ getBasicInfo: true }),
        fetchBranches(),
        fetchSuppliers(),
      ])
    }
    loadData()
  }, [fetch, fetchProducts, fetchBranches, fetchSuppliers, searchTerm, showLowStock])

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

  const supplierOptions = suppliers.map((s) => ({
    value: String(s.supplierId),
    label: s.supplierName,
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
      const { data, file } = getSubmissionData()
      if (!data.productId) throw new Error(t("Product is required"))
      if (!data.branchId) throw new Error(t("Branch is required"))
      if (data.quantity <= 0) throw new Error(t("Quantity must be positive"))
      if (!data.unit) throw new Error(t("Unit is required"))

      let result
      if (editingStock) {
        result = await updateStock(editingStock.stockId, data, file)
      } else {
        result = await createEntryAndUpdateStock(data, file)
      }

      if (!result.success) {
        throw new Error(result.error || t("Stock operation failed"))
      }

      toast.success(t(`Stock entry ${editingStock ? "updated" : "created"} successfully`))


      setIsDialogOpen(false)
      setEditingStock(null)
      resetForm()
      await fetch({ search: searchTerm, lowStock: showLowStock })
    } catch (err) {
      console.error("Stock operation error:", err)
      toast.error(t("Error"), {
        description: error.message || t("Failed to delete stock entry"),
      });
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
      invoice: stock.invoice || null,
      entryDate: new Date().toISOString(),
      supplierId: stock.supplierId ? String(stock.supplierId) : null,
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
      toast.success(t("Success"), {
        description: t("Stock entry deleted successfully"),
      });
      await fetch({ search: searchTerm, lowStock: showLowStock })
    } catch (error) {
      console.error("Stock deletion error:", error)
      toast.error(t("Error"), {
        description: error.message || t("Failed to delete stock entry"),
      });
    }
  }

  const handleRetry = () => {
    fetch({ search: searchTerm, lowStock: showLowStock })
    fetchProducts()
    fetchBranches()
    fetchSuppliers()
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
              disabled={isLoading || prodLoading || branchLoading || supplierLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading || prodLoading || branchLoading || supplierLoading ? "animate-spin" : ""}`} />
              {t("Refresh")}
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button disabled={isLoading || prodLoading || branchLoading || supplierLoading || !canCreate || products.length === 0 || branches.length === 0}>
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
                  <div className="space-y-2">
                    <label htmlFor="productId" className="text-sm font-medium">
                      {t("Product")} <span className="text-red-600">*</span>
                    </label>
                    <Combobox
                      id="productId"
                      name="productId"
                      options={productOptions}
                      placeholder={t("Select product")}
                      value={formData.productId}
                      onChange={(value) => handleChange("productId", value)}
                      disabled={isSaving || prodLoading || products.length === 0}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="branchId" className="text-sm font-medium">
                      {t("Branch")} <span className="text-red-600">*</span>
                    </label>
                    <Combobox
                      id="branchId"
                      name="branchId"
                      options={branchOptions}
                      placeholder={t("Select branch")}
                      value={formData.branchId}
                      onChange={(value) => handleChange("branchId", value)}
                      disabled={isSaving || branchLoading || branches.length === 0}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="supplierId" className="text-sm font-medium">
                      {t("Supplier")}
                    </label>
                    <Combobox
                      id="supplierId"
                      name="supplierId"
                      options={[{ value: "", label: t("No Supplier") }, ...supplierOptions]}
                      placeholder={t("Select supplier")}
                      value={formData.supplierId || ""}
                      onChange={(value) => handleChange("supplierId", value === "" ? null : value)}
                      disabled={isSaving || supplierLoading || suppliers.length === 0}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormImageResize onCallbackData={(data) => handleImageData("invoice", data)} disabled={isSaving} label={t("Invoice Image")} />
                    {formData.invoice && (
                      <FormImagePreview
                        imgSrc={
                          formData.invoice instanceof File ? URL.createObjectURL(formData.invoice) : formData.invoice
                        }
                        height={200}
                      />
                    )}
                  </div>
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
                  value={formData.memo || ""}
                  placeholder={t("N/A")}
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
              <Button variant="outline" onClick={handleRetry} disabled={isLoading || prodLoading || branchLoading || supplierLoading}>
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
                disabled={isLoading || prodLoading || branchLoading || supplierLoading}
              />
            </div>
            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
              disabled={isLoading || prodLoading || branchLoading || supplierLoading}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {showLowStock ? t("Show All") : t("Low Stock Only")}
            </Button>
          </div>
          {view === "card" ? (
            <DataCards
              data={filteredStocks}
              fields={cardFields}
              loading={isLoading || prodLoading || branchLoading || supplierLoading}
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
              loading={isLoading || prodLoading || branchLoading || supplierLoading}
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

