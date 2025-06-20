"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, ShoppingCart, Eye, DollarSign, TrendingUp, Package } from "lucide-react"
import { formatCurrency, formatDate, generateInvoiceCode } from "@/lib/utils"
import { useAuthStore, useCustomerStore, useProductStore, useBranchStore } from "@/stores"
// import { useBranchStore } from '@/stores/branch-store'
import { toast } from "sonner"
import { getSales, createSale } from "@/app/actions/sales"

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saleItems, setSaleItems] = useState([{ productId: "", quantity: 1, price: 0, productName: "" }])
  const [saleDate, setSaleDate] = useState(new Date())
  const inv = generateInvoiceCode()
  const { me, fetch } = useAuthStore()

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
  } = useBranchStore() // Corrected to useBranchStore

  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getSales()
        if (!response.success) throw new Error(response.error)
        setSales(response.sales || [])
      } catch (error) {
        setError(error.message || "Failed to fetch sales")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesData()
    cusFetch()
    proFetch()
    brcFetch()
    fetch()
  }, [cusFetch, proFetch, brcFetch, fetch])

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
    return saleItems.reduce((total, item) => total + item.quantity * item.price, 0)
  }

  const handleAddSale = async (e) => {
    e.preventDefault()

    if (saleItems.some((item) => !item.productId)) {
      toast.error("Please select products for all items")
      return
    }

    const insufficientQuantity = saleItems.some((item) => {
      const product = Product.find((p) => p.productId === item.productId)
      return product && item.quantity > product.quantity
    })

    if (insufficientQuantity) {
      toast.error("One or more products have insufficient quantity")
      return
    }

    const saleData = {
      customerId: e.currentTarget.elements.namedItem("customerId").value,
      branchId: e.currentTarget.elements.namedItem("branchId").value,
      employeeId: me?.employeeId,
      amount: calculateTotal(),
      invoice: inv,
      saleDate: saleDate.toISOString(),
      items: saleItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        amount: item.quantity * item.price,
      })),
    }
    setIsSubmitting(true)

    try {
      const response = await createSale(saleData)
      if (!response.success) throw new Error(response.error)
      setSales((prev) => [...prev, response.sale])
      setSaleItems([{ productId: "", quantity: 1, price: 0, productName: "" }])
      setIsDialogOpen(false)
      toast.success("Sale created successfully")
    } catch (error) {
      console.error("Error:", error)
      toast.error(error.message || "Failed to create sale")
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0)
  const todaySales = sales.filter((sale) => {
    const today = new Date().toDateString()
    return new Date(sale.saleDate).toDateString() === today
  })
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.amount, 0)

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
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Track and manage your sales transactions</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Sale or Record Saled</DialogTitle>
              <DialogDescription>Record a new sales transaction</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSale} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer</Label>
                  <Select name="customerId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {Customer.map((customer) => (
                        <SelectItem key={customer.customerId} value={customer.customerId}>
                          {customer.firstName} {customer.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice">Invoice Number</Label>
                  <Input id="invoice" name="invoice" value={inv} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branchId">Branch ({me?.Employee?.Branch?.branchName})</Label>
                  <Select name="branchId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Leave to choose current branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {Branch.map((branch) => (
                        <SelectItem key={branch.branchId} value={branch.branchId}>
                          {branch.branchName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sale Date</Label>
                  <DatePicker
                    date={saleDate}
                    onDateChange={setSaleDate}
                    placeholder="Select date of birth"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Sale Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSaleItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                {saleItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end"> {/* Added key */}
                    <div className="col-span-5">
                      <Select
                        name={`products[${index}].productId`}
                        value={item.productId}
                        onValueChange={(value) => {
                          const selectedProduct = Product.find((p) => p.productId === value)
                          if (selectedProduct) {
                            if (selectedProduct.quantity <= 0) {
                              toast.error("This product is out of stock")
                              return
                            }
                            updateSaleItem(index, "productId", value)
                            updateSaleItem(index, "price", selectedProduct.sellPrice)
                            updateSaleItem(index, "productName", selectedProduct.productName)
                          }
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product">
                            {item.productId
                              ? `${Product.find((p) => p.productId === item.productId)?.productName || "Selected"}`
                              : "Select product"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Product.filter((product) => product.quantity > 0).map((product) => (
                            <SelectItem key={product.productId} value={product.productId}>
                              {product.productName} - {formatCurrency(product.sellPrice)} (Qty: {product.quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = Number.parseInt(e.target.value)
                          const selectedProduct = Product.find((p) => p.productId === item.productId)
                          if (selectedProduct && newQuantity > selectedProduct.quantity) {
                            toast.error(`Only ${selectedProduct.quantity} available`)
                            return
                          }
                          updateSaleItem(index, "quantity", newQuantity)
                        }}
                        placeholder="Qty"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateSaleItem(index, "price", Number.parseFloat(e.target.value))}
                        placeholder="Price"
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm font-medium">{formatCurrency(item.quantity * item.price)}</div>
                    </div>
                    <div className="col-span-1">
                      {saleItems.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSaleItem(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <div className="text-lg font-semibold">Total: {formatCurrency(calculateTotal())}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Create Sale"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Sales Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
              <p className="text-xs text-muted-foreground">All time sales</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(todayRevenue)}</div>
              <p className="text-xs text-muted-foreground">{todaySales.length} transactions</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sales.length}</div>
              <p className="text-xs text-muted-foreground">Completed sales</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(sales.length > 0 ? totalSales / sales.length : 0)}
              </div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Sales History
          </CardTitle>
          <CardDescription>{filteredSales.length} sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Sales Person</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <motion.tr
                    key={sale.saleId} // Added unique key
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <TableCell>
                      <div className="font-medium">{sale.invoice || "-"}</div>
                    </TableCell>
                    <TableCell>
                      {sale.Customer.firstName} {sale.Customer.lastName}
                    </TableCell>
                    <TableCell>
                      {sale.Employee.firstName} {sale.Employee.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {sale?.Saledetail?.length ? (
                          <>
                            {sale.Saledetail.slice(0, 2).map((detail, index) => (
                              <div key={`${sale.saleId}-detail-${index}`} className="text-sm">
                                {detail.quantity}x {detail.Product?.productName || "Unknown product"}
                              </div>
                            ))}
                            {sale.Saledetail.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{sale.Saledetail.length - 2} more items
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground">No items</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(sale.amount)}</div>
                    </TableCell>
                    <TableCell>{formatDate(sale.saleDate)}</TableCell>
                    <TableCell>
                      <Badge variant={sale.status === "active" ? "default" : "secondary"}>
                        {sale.status}
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



// "use client"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { DatePicker } from "@/components/ui/date-picker"
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
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Plus, Search, ShoppingCart, Eye, DollarSign, TrendingUp, Package } from "lucide-react"
// import { formatCurrency, formatDate, generateInvoiceCode } from "@/lib/utils"
// import { useAuthStore, useCustomerStore, useProductStore } from "@/stores"
// import { toast } from "sonner"
// import { getSales, createSale } from "@/app/actions/sales" 

// export const dynamic = 'force-dynamic';
// export default function SalesPage() {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [saleItems, setSaleItems] = useState([{ productId: "", quantity: 1, price: 0, productName: "" }])
//   const [saleDate, setSaleDate] = useState(new Date())
//   const inv = generateInvoiceCode()
//   const { me, fetch } = useAuthStore()

//   const [sales, setSales] = useState([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState(null)

//   const {
//     items: Customer,
//     fetch: cusFetch,
//   } = useCustomerStore()

//   const {
//     items: Product,
//     fetch: proFetch,
//   } = useProductStore()

//   const {
//     items: Branch,
//     fetch: brcFetch,
//   } = useProductStore() // Note: Assuming this was meant to be useBranchStore, adjust if incorrect

//   useEffect(() => {
//     const fetchSalesData = async () => {
//       setIsLoading(true)
//       setError(null)
//       try {
//         const response = await getSales()
//         if (!response.success) throw new Error(response.error)
//         setSales(response.sales || [])
//       } catch (error) {
//         setError(error.message || "Failed to fetch sales")
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchSalesData()
//     cusFetch()
//     proFetch()
//     brcFetch()
//     fetch()
//   }, [cusFetch, proFetch, brcFetch, fetch])

//   const filteredSales = sales.filter(
//     (sale) =>
//       sale.Customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       sale.Customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       sale.invoice?.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   const addSaleItem = () => {
//     setSaleItems([...saleItems, { productId: "", quantity: 1, price: 0 }])
//   }

//   const removeSaleItem = (index) => {
//     setSaleItems(saleItems.filter((_, i) => i !== index))
//   }

//   const updateSaleItem = (index, field, value) => {
//     setSaleItems((prev) =>
//       prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
//     )
//   }

//   const calculateTotal = () => {
//     return saleItems.reduce((total, item) => total + item.quantity * item.price, 0)
//   }

//   const handleAddSale = async (e) => {
//     e.preventDefault()

//     if (saleItems.some((item) => !item.productId)) {
//       toast.error("Please select products for all items")
//       return
//     }

//     const insufficientQuantity = saleItems.some((item) => {
//       const product = Product.find((p) => p.productId === item.productId)
//       return product && item.quantity > product.quantity
//     })

//     if (insufficientQuantity) {
//       toast.error("One or more products have insufficient quantity")
//       return
//     }

//     const saleData = {
//       customerId: e.currentTarget.elements.namedItem("customerId").value,
//       branchId: e.currentTarget.elements.namedItem("branchId").value,
//       employeeId: me?.employeeId,
//       amount: calculateTotal(),
//       invoice: inv,
//       saleDate: saleDate.toISOString(),
//       items: saleItems.map((item) => ({
//         productId: item.productId,
//         quantity: item.quantity,
//         amount: item.quantity * item.price,
//       })),
//     }
//     setIsSubmitting(true)

//     try {
//       const response = await createSale(saleData)
//       if (!response.success) throw new Error(response.error)
//       setSales((prev) => [...prev, response.sale])
//       setSaleItems([{ productId: "", quantity: 1, price: 0 }])
//       setIsDialogOpen(false)
//       toast.success("Sale created successfully")
//     } catch (error) {
//       console.error("Error:", error)
//       toast.error(error.message || "Failed to create sale")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0)
//   const todaySales = sales.filter((sale) => {
//     const today = new Date().toDateString()
//     return new Date(sale.saleDate).toDateString() === today
//   })
//   const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.amount, 0)

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 text-red-500">
//         {error}
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
//           <p className="text-muted-foreground">Track and manage your sales transactions</p>
//         </div>

//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               New Sale
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Create New Sale or Record Saled</DialogTitle>
//               <DialogDescription>Record a new sales transaction</DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleAddSale} className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="customerId">Customer</Label>
//                   <Select name="customerId" required>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select customer" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {Customer.map((customer) => (
//                         <SelectItem key={customer.customerId} value={customer.customerId}>
//                           {customer.firstName} {customer.lastName}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="invoice">Invoice Number</Label>
//                   <Input id="invoice" name="invoice" value={inv} readOnly />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="branchId">Branch ({me?.Employee?.Branch?.branchName})</Label>
//                   <Select name="branchId" required>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Leave to choose current branch" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {Branch.map((branch) => (
//                         <SelectItem key={branch.branchId} value={branch.branchId}>
//                           {branch.branchName}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Sale Date</Label>
//                   <DatePicker
//                     date={saleDate}
//                     onDateChange={setSaleDate}
//                     placeholder="Select date of birth"
//                   />
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <Label>Sale Items</Label>
//                   <Button type="button" variant="outline" size="sm" onClick={addSaleItem}>
//                     <Plus className="h-4 w-4 mr-1" />
//                     Add Item
//                   </Button>
//                 </div>

//                 {saleItems.map((item, index) => (
//                   <div key={index} className="grid grid-cols-12 gap-2 items-end">
//                     <div className="col-span-5">
//                       <Select
//                         name={`products[${index}].productId`}
//                         value={item.productId}
//                         onValueChange={(value) => {
//                           const selectedProduct = Product.find((p) => p.productId === value)
//                           if (selectedProduct) {
//                             if (selectedProduct.quantity <= 0) {
//                               toast.error("This product is out of stock")
//                               return
//                             }
//                             updateSaleItem(index, "productId", value)
//                             updateSaleItem(index, "price", selectedProduct.sellPrice)
//                             updateSaleItem(index, "productName", selectedProduct.productName)
//                           }
//                         }}
//                         required
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select product">
//                             {item.productId
//                               ? `${
//                                   Product.find((p) => p.productId === item.productId)?.productName || "Selected"
//                                 }`
//                               : "Select product"}
//                           </SelectValue>
//                         </SelectTrigger>
//                         <SelectContent>
//                           {Product.filter((product) => product.quantity > 0).map((product) => (
//                             <SelectItem key={product.productId} value={product.productId}>
//                               {product.productName} - {formatCurrency(product.sellPrice)} (Qty: {product.quantity})
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="col-span-2">
//                       <Input
//                         type="number"
//                         min="1"
//                         value={item.quantity}
//                         onChange={(e) => {
//                           const newQuantity = Number.parseInt(e.target.value)
//                           const selectedProduct = Product.find((p) => p.productId === item.productId)
//                           if (selectedProduct && newQuantity > selectedProduct.quantity) {
//                             toast.error(`Only ${selectedProduct.quantity} available`)
//                             return
//                           }
//                           updateSaleItem(index, "quantity", newQuantity)
//                         }}
//                         placeholder="Qty"
//                       />
//                     </div>
//                     <div className="col-span-2">
//                       <Input
//                         type="number"
//                         step="0.01"
//                         value={item.price}
//                         onChange={(e) => updateSaleItem(index, "price", Number.parseFloat(e.target.value))}
//                         placeholder="Price"
//                       />
//                     </div>
//                     <div className="col-span-2">
//                       <div className="text-sm font-medium">{formatCurrency(item.quantity * item.price)}</div>
//                     </div>
//                     <div className="col-span-1">
//                       {saleItems.length > 1 && (
//                         <Button
//                           type="button"
//                           variant="outline"
//                           size="sm"
//                           onClick={() => removeSaleItem(index)}
//                         >
//                           ×
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 ))}

//                 <div className="flex justify-end">
//                   <div className="text-lg font-semibold">Total: {formatCurrency(calculateTotal())}</div>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={isSubmitting}>
//                   {isSubmitting ? "Processing..." : "Create Sale"}
//                 </Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </motion.div>

//       {/* Sales Stats */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//               <DollarSign className="h-4 w-4 text-green-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
//               <p className="text-xs text-muted-foreground">All time sales</p>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
//               <TrendingUp className="h-4 w-4 text-blue-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{formatCurrency(todayRevenue)}</div>
//               <p className="text-xs text-muted-foreground">{todaySales.length} transactions</p>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
//               <ShoppingCart className="h-4 w-4 text-purple-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{sales.length}</div>
//               <p className="text-xs text-muted-foreground">Completed sales</p>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
//               <Package className="h-4 w-4 text-orange-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {formatCurrency(sales.length > 0 ? totalSales / sales.length : 0)}
//               </div>
//               <p className="text-xs text-muted-foreground">Per transaction</p>
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <ShoppingCart className="h-5 w-5" />
//             Sales History
//           </CardTitle>
//           <CardDescription>{filteredSales.length} sales transactions</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search sales..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Invoice</TableHead>
//                   <TableHead>Customer</TableHead>
//                   <TableHead>Sales Person</TableHead>
//                   <TableHead>Items</TableHead>
//                   <TableHead>Amount</TableHead>
//                   <TableHead>Date</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredSales.map((sale) => (
//                   <motion.tr
//                     key={sale.saleId}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="group"
//                   >
//                     <TableCell>
//                       <div className="font-medium">{sale.invoice || "-"}</div>
//                     </TableCell>
//                     <TableCell>
//                       {sale.Customer.firstName} {sale.Customer.lastName}
//                     </TableCell>
//                     <TableCell>
//                       {sale.Employee.firstName} {sale.Employee.lastName}
//                     </TableCell>
//                     <TableCell>
//                       <div className="space-y-1">
//                         {sale?.Saledetail?.length ? (
//                           <>
//                             {sale.Saledetail.slice(0, 2).map((detail, index) => (
//                               <div key={index} className="text-sm">
//                                 {detail.quantity}x {detail.Product?.productName || "Unknown product"}
//                               </div>
//                             ))}
//                             {sale.Saledetail.length > 2 && (
//                               <div className="text-xs text-muted-foreground">
//                                 +{sale.Saledetail.length - 2} more items
//                               </div>
//                             )}
//                           </>
//                         ) : (
//                           <div className="text-sm text-muted-foreground">No items</div>
//                         )}
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <div className="font-medium">{formatCurrency(sale.amount)}</div>
//                     </TableCell>
//                     <TableCell>{formatDate(sale.saleDate)}</TableCell>
//                     <TableCell>
//                       <Badge variant={sale.status === "active" ? "default" : "secondary"}>
//                         {sale.status}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <Button variant="ghost" size="sm">
//                           <Eye className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </motion.tr>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


