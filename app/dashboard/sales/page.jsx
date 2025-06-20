"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormInput, FormComboBox } from "@/components/form"
import { Plus, Search, ShoppingCart, Eye, DollarSign, TrendingUp, Package } from "lucide-react"
import { formatCurrency, formatDate, generateInvoiceCode } from "@/lib/utils"
import { useAuthStore, useCustomerStore, useProductStore, useBranchStore } from "@/stores"
import { toast } from "sonner"
import { getSales, createSale } from "@/app/actions/sales"
import { useTranslation } from "react-i18next"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function SalesPage() {
  const { t } = useTranslation("common")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saleItems, setSaleItems] = useState([{ productId: "", quantity: 1, price: 0, productName: "" }])
  const [saleDate, setSaleDate] = useState(new Date())
  const [customerId, setCustomerId] = useState("")
  const [branchId, setBranchId] = useState("")
  const inv = generateInvoiceCode()
  const { items, fetch } = useAuthStore()

  const [sales, setSales] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const {
    items: Customer,
    fetch: cusFetch,
  } = useCustomerStore()

  const {
    items: Product,
    fetch: proFetch,
  } = useProductStore()

  const {
    items: Branch,
    fetch: brcFetch,
  } = useBranchStore()

  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getSales()
        if (!response.success) throw new Error(response.error)
        setSales(response.sales || [])
      } catch (error) {
        setError(error.message || t("FailedToFetchSales"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesData()
    cusFetch()
    proFetch({ getBasicInfo: true, })
    brcFetch()
    fetch()
  }, [cusFetch, proFetch, brcFetch, fetch, items, t])

  console.log(Product)

  const filteredSales = sales.filter(
    (sale) =>
      sale.Customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.Customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.invoice?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addSaleItem = () => {
    setSaleItems([...saleItems, { productId: "", quantity: 1, price: 0, productName: "" }])
  }

  const removeSaleItem = (index) => {
    setSaleItems(saleItems.filter((_, i) => i !== index))
  }

  const updateSaleItem = (index, field, value) => {
    setSaleItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + Number(item.quantity) * Number(item.price), 0)
  }

  const handleAddSale = async (e) => {
    e.preventDefault()

    if (!customerId) {
      toast.error(t("SelectCustomerError"))
      return
    }

    if (!branchId) {
      toast.error(t("SelectBranchError"))
      return
    }

    if (saleItems.some((item) => !item.productId)) {
      toast.error(t("SelectProductsError"))
      return
    }

    const insufficientQuantity = saleItems.some((item) => {
      const product = Product.find((p) => p.productId === item.productId)
      const stock = product?.Stock?.find((s) => s.branchId === branchId)
      return product && stock && Number(item.quantity) > stock.quantity
    })

    if (insufficientQuantity) {
      toast.error(t("InsufficientQuantityError"))
      return
    }

    const saleData = {
      customerId,
      branchId,
      employeeId: items?.employeeId,
      amount: calculateTotal().toFixed(2),
      invoice: inv,
      saleDate: saleDate.toISOString(),
      items: saleItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        amount: (Number(item.quantity) * Number(item.price)).toFixed(2),
      })),
    }
    setIsSubmitting(true)

    try {
      const response = await createSale(saleData)
      if (!response.success) throw new Error(response.error)
      setSales((prev) => [...prev, response.sale])
      setSaleItems([{ productId: "", quantity: 1, price: 0, productName: "" }])
      setCustomerId("")
      setBranchId("")
      setSaleDate(new Date())
      setIsDialogOpen(false)
      toast.success(t("SaleCreatedSuccess"))
    } catch (error) {
      console.error("Error:", error)
      toast.error(error.message || t("FailedToCreateSale"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.amount), 0)
  const todaySales = sales.filter((sale) => {
    const today = new Date().toDateString()
    return new Date(sale.saleDate).toDateString() === today
  })
  const todayRevenue = todaySales.reduce((sum, sale) => sum + Number(sale.amount), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Sales")}</h1>
          <p className="text-muted-foreground">{t("TrackManageSales")}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setCustomerId("")
            setBranchId("")
            setSaleItems([{ productId: "", quantity: 1, price: 0, productName: "" }])
            setSaleDate(new Date())
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("NewSale")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("CreateNewSale")}</DialogTitle>
              <DialogDescription>{t("RecordNewSale")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSale} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormComboBox
                    name="customerId"
                    optID="value"
                    optLabel="label"
                    label={t("Customer")}
                    item={Customer.length ? Customer.map((customer) => ({
                      value: customer.customerId,
                      label: `${customer.firstName} ${customer.lastName}`,
                    })) : []}
                    defaultValue={customerId}
                    onCallbackSelect={(value) => setCustomerId(value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <FormInput
                    id="invoice"
                    name="invoice"
                    value={inv}
                    disabled={true}
                    label={t("InvoiceNumber")}
                    placeholder={t("InvoiceNumber")}
                    onCallbackInput={() => { }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormComboBox
                    name="branchId"
                    optID="value"
                    optLabel="label"
                    label={`${t("Branch")} (${items?.Employee?.Branch?.branchName || t("NoBranch")})`}
                    item={Branch.length ? Branch.map((branch) => ({
                      value: branch.branchId,
                      label: branch.branchName,
                    })) : []}
                    defaultValue={branchId}
                    onCallbackSelect={(value) => setBranchId(value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("SaleDate")}</Label>
                  <DatePicker
                    date={saleDate}
                    onDateChange={setSaleDate}
                    placeholder={t("SelectSaleDate")}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>{t(" ")}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSaleItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t("AddItem")}
                  </Button>
                </div>

                {saleItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <FormComboBox
                        name={`products[${index}].productId`}
                        optID="productId"
                        optLabel="label"
                        label={t("Product")}
                        item={
                          Product.map((product) => {
                            const branchStock = product.Stock?.find((s) => s.branchId === branchId)
                            const totalQty = product.Stock?.reduce((sum, s) => sum + s.quantity, 0) || 0
                            const branchQty = branchStock?.quantity || 0

                            if (branchQty <= 0) return null

                            return {
                              productId: product.productId,
                              label: `${product.productName} - ${formatCurrency(product.sellPrice)} (Qty: ${branchQty}/${totalQty})`
                            }
                          }).filter(Boolean)
                        }


                        defaultValue={item.productId}
                        onCallbackSelect={(value) => {
                          const selectedProduct = Product.find((p) => p.productId === value)
                          if (selectedProduct) {
                            const stock = selectedProduct.Stock?.find((s) => s.branchId === branchId)
                            if (!stock || stock.quantity <= 0) {
                              toast.error(t("ProductOutOfStock"))
                              return
                            }
                            updateSaleItem(index, "productId", value)
                            updateSaleItem(index, "price", Number(selectedProduct.sellPrice).toFixed(2))
                            updateSaleItem(index, "productName", selectedProduct.productName)
                          }
                        }}
                        disabled={isSubmitting || !branchId}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <FormInput
                        name={`products[${index}].quantity`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onCallbackInput={(value) => {
                          const newQuantity = Number.parseInt(value)
                          if (isNaN(newQuantity) || newQuantity < 1) return
                          const selectedProduct = Product.find((p) => p.productId === item.productId)
                          const stock = selectedProduct?.Stock?.find((s) => s.branchId === branchId)
                          if (selectedProduct && stock && newQuantity > stock.quantity) {
                            toast.error(t("InsufficientQuantity", { quantity: stock.quantity }))
                            return
                          }
                          updateSaleItem(index, "quantity", newQuantity)
                        }}
                        label={t("Quantity")}
                        placeholder={t("quantity")}
                        disabled={isSubmitting || !item.productId}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <FormInput
                        name={`products[${index}].price`}
                        type="number"
                        step="0.01"
                        value={item.price}
                        onCallbackInput={(value) => {
                          const newPrice = Number.parseFloat(value)
                          if (isNaN(newPrice)) return
                          updateSaleItem(index, "price", newPrice.toFixed(2))
                        }}
                        label={t("Price")}
                        placeholder={t("Price")}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm font-medium">
                        {formatCurrency(Number(item.quantity) * Number(item.price))}
                      </div>
                    </div>
                    <div className="col-span-1">
                      {saleItems.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8"
                          onClick={() => removeSaleItem(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <div className="text-lg font-semibold">{t("Total")}: {formatCurrency(calculateTotal())}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t("Cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("Submitting") : t("CreateSale")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("TotalRevenue")}</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
              <p className="text-xs text-muted-foreground">{t("AllTimeSales")}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("TodaysSales")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(todayRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {t("Transactions", { count: todaySales.length })}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("TotalOrders")}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sales.length}</div>
              <p className="text-xs text-muted-foreground">{t("TotalSales")}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("AvgOrderValue")}</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(sales.length > 0 ? totalSales / sales.length : 0)}
              </div>
              <p className="text-xs text-muted-foreground">{t("PerTransaction")}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t("SalesHistory")}
          </CardTitle>
          <CardDescription>{t("sales", { count: sales.length })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <FormInput
                name="search"
                value={searchTerm}
                onCallbackInput={(value) => setSearchTerm(value)}
                placeholder={t("SearchSales")}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Invoice")}</TableHead>
                <TableHead>{t("Customer")}</TableHead>
                <TableHead>{t("SalesPerson")}</TableHead>
                <TableHead>{t("Items")}</TableHead>
                <TableHead>{t("Amount")}</TableHead>
                <TableHead>{t("Date")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <motion.tr
                  key={sale.saleId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="table-row"
                >
                  <TableCell>
                    <div className="font-medium">{sale.invoice || "-"}</div>
                  </TableCell>
                  <TableCell>
                    {sale.Customer}
                  </TableCell>
                  <TableCell>
                    {sale.Employee}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {sale?.S?.length ? (
                        <>
                          {sale.SS.slice(0, 2).map((detail, index) => (
                            <div key={`${sale.saleId}-detail-${index}`} className="text-sm">
                              {detail.quantity}x {detail.Product?.productName || t("UnknownProduct")}
                            </div>
                          ))}
                          {sale.SS.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              {t("MoreItems", { count: sale.SS.length - 2 })}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">{t("NoItems")}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(sale.amount)}</div>
                  </TableCell>
                  <TableCell>{formatDate(sale.saleDate)}</TableCell>
                  <TableCell>
                    <Badge variant={sale.status === "active" ? "default" : "secondary"}>
                      {t(sale.status.charAt(0).toUpperCase() + sale.status.slice(1))}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

