"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, FileText, TrendingUp, Package, Users, DollarSign, Calendar, FileSpreadsheet, Loader2, RefreshCw } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useReportStore } from "@/stores/report-store"
import { useTranslation } from "react-i18next" // Import useTranslation

export const dynamic = 'force-dynamic';
export default function ReportsPage() {
  const { t } = useTranslation('common'); // Initialize useTranslation
  const {
    salesReport,
    inventoryReport,
    isLoading,
    error,
    fetchReports,
    clearError,
  } = useReportStore()
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })
  const [exportFormat, setExportFormat] = useState("csv")
  const [exportType, setExportType] = useState("sales")

  useEffect(() => {
    fetchReports(dateRange.startDate, dateRange.endDate)
  }, [fetchReports, dateRange])

  const handleExport = async () => {
    try {
      const filters =
        exportType === "sales"
          ? {
              saleDate: {
                gte: new Date(dateRange.startDate),
                lte: new Date(dateRange.endDate),
              },
              status: "active",
            }
          : {}

      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: exportType,
          format: exportFormat,
          filters,
        }),
      })

      if (!response.ok) throw new Error(t("Failed to export report"))

      if (exportFormat === "csv") {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${exportType}-report-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast({
          title: t("Success"),
          description: t("Report exported as {{format}}", { format: exportFormat.toUpperCase() }),
        })
      } else {
        // Placeholder for PDF (requires additional library like jsPDF)
        toast({
          title: t("Info"),
          description: t("PDF export feature coming soon!"),
        })
      }
    } catch (error) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to export report"),
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    clearError()
    fetchReports(dateRange.startDate, dateRange.endDate)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
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
          <h1 className="text-3xl font-bold tracking-tight">{t("Reports & Analytics")}</h1>
          <p className="text-muted-foreground">{t("Comprehensive business insights and data export")}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("Refresh")}
          </Button>
          <Select value={exportType} onValueChange={setExportType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">{t("Sales")}</SelectItem>
              <SelectItem value="inventory">{t("Inventory")}</SelectItem>
              <SelectItem value="customers">{t("Customers")}</SelectItem>
              <SelectItem value="employees">{t("Employees")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={isLoading}>
            {exportFormat === "csv" ? (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {t("Export {{format}}", { format: exportFormat.toUpperCase() })}
          </Button>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">{t("Error loading reports")}</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={handleRetry}>
                {t("Try Again")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("Report Period")}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{t("From:")}</label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-auto"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{t("To:")}</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-auto"
                disabled={isLoading}
              />
            </div>
            <Button onClick={() => fetchReports(dateRange.startDate, dateRange.endDate)} variant="outline" disabled={isLoading}>
              {t("Update Reports")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">{t("Sales Report")}</TabsTrigger>
          <TabsTrigger value="inventory">{t("Inventory Report")}</TabsTrigger>
          <TabsTrigger value="performance">{t("Performance")}</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          {salesReport ? (
            <>
              {/* Sales Summary */}
              <div className="grid gap-4 md:grid-cols-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("Total Revenue")}</CardTitle>
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(salesReport.summary?._sum?.amount || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">{t("Period total")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("Total Sales")}</CardTitle>
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{salesReport.summary?._count || 0}</div>
                      <p className="text-xs text-muted-foreground">{t("Transactions")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("Average Sale")}</CardTitle>
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(salesReport.summary?._avg?.amount || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">{t("Per transaction")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("Daily Average")}</CardTitle>
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency((salesReport.summary?._sum?.amount || 0) / 30)}
                      </div>
                      <p className="text-xs text-muted-foreground">{t("Revenue per day")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {t("Top Selling Products")}
                  </CardTitle>
                  <CardDescription>{t("Best performing products by revenue")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("Product")}</TableHead>
                          <TableHead>{t("Quantity Sold")}</TableHead>
                          <TableHead>{t("Revenue")}</TableHead>
                          <TableHead>{t("Orders")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesReport.topProducts?.slice(0, 10).map((product) => (
                          <TableRow key={product.productId}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{product.product?.productName || "-"}</div>
                                <div className="text-sm text-muted-foreground">{product.product?.productCode || "-"}</div>
                              </div>
                            </TableCell>
                            <TableCell>{product._sum?.quantity || 0}</TableCell>
                            <TableCell>{formatCurrency(product._sum?.amount || 0)}</TableCell>
                            <TableCell>{product._count || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t("Top Customers")}
                  </CardTitle>
                  <CardDescription>{t("Highest value customers by revenue")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("Customer")}</TableHead>
                          <TableHead>{t("Total Spent")}</TableHead>
                          <TableHead>{t("Orders")}</TableHead>
                          <TableHead>{t("Average Order")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesReport.topCustomers?.slice(0, 10).map((customer) => (
                          <TableRow key={customer.customerId}>
                            <TableCell>
                              {customer.customer?.firstName || "-"} {customer.customer?.lastName || "-"}
                            </TableCell>
                            <TableCell>{formatCurrency(customer._sum?.amount || 0)}</TableCell>
                            <TableCell>{customer._count || 0}</TableCell>
                            <TableCell>
                              {formatCurrency((customer._sum?.amount || 0) / (customer._count || 1))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{t("No sales data available for the selected period.")}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          {inventoryReport ? (
            <>
              {/* Inventory Summary */}
              <div className="grid gap-4 md:grid-cols-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("Total Products")}</CardTitle>
                      <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{inventoryReport.summary?.totalProducts || 0}</div>
                      <p className="text-xs text-muted-foreground">{t("In inventory")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("Inventory Value")}</CardTitle>
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(inventoryReport.summary?.totalCostValue || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">{t("Cost value")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("Potential Revenue")}</CardTitle>
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(inventoryReport.summary?.totalSellValue || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">{t("Sell value")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("Potential Profit")}</CardTitle>
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(inventoryReport.summary?.potentialProfit || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">{t("If all sold")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Low Stock Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    {t("Low Stock Alert")}
                  </CardTitle>
                  <CardDescription>
                    {t("{{count}} items need restocking", { count: inventoryReport.summary?.lowStockCount || 0 })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("Product")}</TableHead>
                          <TableHead>{t("Category")}</TableHead>
                          <TableHead>{t("Current Stock")}</TableHead>
                          <TableHead>{t("Status")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventoryReport.lowStockItems?.slice(0, 10).map((item) => (
                          <TableRow key={item.stockId}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.product?.productName || "-"}</div>
                                <div className="text-sm text-muted-foreground">{item.product?.productCode || "-"}</div>
                              </div>
                            </TableCell>
                            <TableCell>{item.product?.category?.categoryName || "-"}</TableCell>
                            <TableCell>{item.quantity || 0}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${item.quantity === 0
                                    ? "bg-red-100 text-red-800"
                                    : item.quantity < 10
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {item.quantity === 0 ? t("Out of Stock") : item.quantity < 10 ? t("Critical") : t("Low Stock")}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Stock Entries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t("Recent Stock Entries")}
                  </CardTitle>
                  <CardDescription>{t("Latest inventory additions")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("Product")}</TableHead>
                          <TableHead>{t("Supplier")}</TableHead>
                          <TableHead>{t("Quantity")}</TableHead>
                          <TableHead>{t("Entry Price")}</TableHead>
                          <TableHead>{t("Date")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventoryReport.recentEntries?.slice(0, 10).map((entry) => (
                          <TableRow key={entry.entryId}>
                            <TableCell>{entry.product?.productName || "-"}</TableCell>
                            <TableCell>{entry.supplier?.supplierName || "-"}</TableCell>
                            <TableCell>{entry.quantity || 0}</TableCell>
                            <TableCell>{formatCurrency(entry.entryPrice || 0)}</TableCell>
                            <TableCell>{formatDate(entry.entryDate)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{t("No inventory data available.")}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {salesReport ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("Employee Performance")}
                </CardTitle>
                <CardDescription>{t("Sales performance by employee")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("Employee")}</TableHead>
                        <TableHead>{t("Department")}</TableHead>
                        <TableHead>{t("Total Sales")}</TableHead>
                        <TableHead>{t("Revenue")}</TableHead>
                        <TableHead>{t("Average Sale")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesReport.salesByEmployee?.map((employee) => (
                        <TableRow key={employee.employeeId}>
                          <TableCell>
                            {employee.employee?.firstName || "-"} {employee.employee?.lastName || "-"}
                          </TableCell>
                          <TableCell>{employee.employee?.department?.departmentName || "-"}</TableCell>
                          <TableCell>{employee._count || 0}</TableCell>
                          <TableCell>{formatCurrency(employee._sum?.amount || 0)}</TableCell>
                          <TableCell>
                            {formatCurrency((employee._sum?.amount || 0) / (employee._count || 1))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{t("No performance data available for the selected period.")}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


// "use client"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { BarChart3, FileText, TrendingUp, Package, Users, DollarSign, Calendar, FileSpreadsheet, Loader2, RefreshCw } from "lucide-react"
// import { formatCurrency, formatDate } from "@/lib/utils"
// import { useToast } from "@/components/ui/use-toast"
// import { useReportStore } from "@/stores/report-store"



// export const dynamic = 'force-dynamic';
// export default function ReportsPage() {
//   const {
//     salesReport,
//     inventoryReport,
//     isLoading,
//     error,
//     fetchReports,
//     clearError,
//   } = useReportStore()
//   const { toast } = useToast()
//   const [dateRange, setDateRange] = useState({
//     startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
//     endDate: new Date().toISOString().split("T")[0],
//   })
//   const [exportFormat, setExportFormat] = useState("csv")
//   const [exportType, setExportType] = useState("sales")

//   useEffect(() => {
//     fetchReports(dateRange.startDate, dateRange.endDate)
//   }, [fetchReports, dateRange])

//   const handleExport = async () => {
//     try {
//       const filters =
//         exportType === "sales"
//           ? {
//             saleDate: {
//               gte: new Date(dateRange.startDate),
//               lte: new Date(dateRange.endDate),
//             },
//             status: "active",
//           }
//           : {}

//       const response = await fetch("/api/reports/export", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type: exportType,
//           format: exportFormat,
//           filters,
//         }),
//       })

//       if (!response.ok) throw new Error("Failed to export report")

//       if (exportFormat === "csv") {
//         const blob = await response.blob()
//         const url = window.URL.createObjectURL(blob)
//         const a = document.createElement("a")
//         a.href = url
//         a.download = `${exportType}-report-${new Date().toISOString().split("T")[0]}.csv`
//         document.body.appendChild(a)
//         a.click()
//         window.URL.revokeObjectURL(url)
//         document.body.removeChild(a)
//         toast({
//           title: "Success",
//           description: `Report exported as ${exportFormat.toUpperCase()}`,
//         })
//       } else {
//         // Placeholder for PDF (requires additional library like jsPDF)
//         toast({
//           title: "Info",
//           description: "PDF export feature coming soon!",
//         })
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to export report",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleRetry = () => {
//     clearError()
//     fetchReports(dateRange.startDate, dateRange.endDate)
//   }

//   if (isLoading) {
//     return (
//       <Card>
//         <CardContent className="flex items-center justify-center h-64">
//           <Loader2 className="h-8 w-8 animate-spin text-primary" />
//         </CardContent>
//       </Card>
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
//           <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
//           <p className="text-muted-foreground">Comprehensive business insights and data export</p>
//         </div>

//         <div className="flex items-center gap-2">
//           <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
//             <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
//             Refresh
//           </Button>
//           <Select value={exportType} onValueChange={setExportType}>
//             <SelectTrigger className="w-32">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="sales">Sales</SelectItem>
//               <SelectItem value="inventory">Inventory</SelectItem>
//               <SelectItem value="customers">Customers</SelectItem>
//               <SelectItem value="employees">Employees</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={exportFormat} onValueChange={setExportFormat}>
//             <SelectTrigger className="w-24">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="csv">CSV</SelectItem>
//               <SelectItem value="pdf">PDF</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button onClick={handleExport} disabled={isLoading}>
//             {exportFormat === "csv" ? (
//               <FileSpreadsheet className="mr-2 h-4 w-4" />
//             ) : (
//               <FileText className="mr-2 h-4 w-4" />
//             )}
//             Export {exportFormat.toUpperCase()}
//           </Button>
//         </div>
//       </motion.div>

//       {/* Error Display */}
//       {error && (
//         <Card className="border-destructive">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-destructive font-medium">Error loading reports</p>
//                 <p className="text-sm text-muted-foreground">{error}</p>
//               </div>
//               <Button variant="outline" onClick={handleRetry}>
//                 Try Again
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Date Range Filter */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Calendar className="h-5 w-5" />
//             Report Period
//             {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2">
//               <label className="text-sm font-medium">From:</label>
//               <Input
//                 type="date"
//                 value={dateRange.startDate}
//                 onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
//                 className="w-auto"
//                 disabled={isLoading}
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <label className="text-sm font-medium">To:</label>
//               <Input
//                 type="date"
//                 value={dateRange.endDate}
//                 onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
//                 className="w-auto"
//                 disabled={isLoading}
//               />
//             </div>
//             <Button onClick={() => fetchReports(dateRange.startDate, dateRange.endDate)} variant="outline" disabled={isLoading}>
//               Update Reports
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       <Tabs defaultValue="sales" className="space-y-6">
//         <TabsList>
//           <TabsTrigger value="sales">Sales Report</TabsTrigger>
//           <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
//           <TabsTrigger value="performance">Performance</TabsTrigger>
//         </TabsList>

//         <TabsContent value="sales" className="space-y-6">
//           {salesReport ? (
//             <>
//               {/* Sales Summary */}
//               <div className="grid gap-4 md:grid-cols-4">
//                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//                       <DollarSign className="h-4 w-4 text-green-600" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">
//                         {formatCurrency(salesReport.summary?._sum?.amount || 0)}
//                       </div>
//                       <p className="text-xs text-muted-foreground">Period total</p>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
//                       <BarChart3 className="h-4 w-4 text-blue-600" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">{salesReport.summary?._count || 0}</div>
//                       <p className="text-xs text-muted-foreground">Transactions</p>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
//                       <TrendingUp className="h-4 w-4 text-purple-600" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">
//                         {formatCurrency(salesReport.summary?._avg?.amount || 0)}
//                       </div>
//                       <p className="text-xs text-muted-foreground">Per transaction</p>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
//                       <Calendar className="h-4 w-4 text-orange-600" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">
//                         {formatCurrency((salesReport.summary?._sum?.amount || 0) / 30)}
//                       </div>
//                       <p className="text-xs text-muted-foreground">Revenue per day</p>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//               </div>

//               {/* Top Products */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Package className="h-5 w-5" />
//                     Top Selling Products
//                   </CardTitle>
//                   <CardDescription>Best performing products by revenue</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="rounded-md border">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Product</TableHead>
//                           <TableHead>Quantity Sold</TableHead>
//                           <TableHead>Revenue</TableHead>
//                           <TableHead>Orders</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {salesReport.topProducts?.slice(0, 10).map((product) => (
//                           <TableRow key={product.productId}>
//                             <TableCell>
//                               <div>
//                                 <div className="font-medium">{product.product?.productName || "-"}</div>
//                                 <div className="text-sm text-muted-foreground">{product.product?.productCode || "-"}</div>
//                               </div>
//                             </TableCell>
//                             <TableCell>{product._sum?.quantity || 0}</TableCell>
//                             <TableCell>{formatCurrency(product._sum?.amount || 0)}</TableCell>
//                             <TableCell>{product._count || 0}</TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Top Customers */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Users className="h-5 w-5" />
//                     Top Customers
//                   </CardTitle>
//                   <CardDescription>Highest value customers by revenue</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="rounded-md border">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Customer</TableHead>
//                           <TableHead>Total Spent</TableHead>
//                           <TableHead>Orders</TableHead>
//                           <TableHead>Average Order</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {salesReport.topCustomers?.slice(0, 10).map((customer) => (
//                           <TableRow key={customer.customerId}>
//                             <TableCell>
//                               {customer.customer?.firstName || "-"} {customer.customer?.lastName || "-"}
//                             </TableCell>
//                             <TableCell>{formatCurrency(customer._sum?.amount || 0)}</TableCell>
//                             <TableCell>{customer._count || 0}</TableCell>
//                             <TableCell>
//                               {formatCurrency((customer._sum?.amount || 0) / (customer._count || 1))}
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 </CardContent>
//               </Card>
//             </>
//           ) : (
//             <Card>
//               <CardContent className="pt-6">
//                 <p className="text-muted-foreground">No sales data available for the selected period.</p>
//               </CardContent>
//             </Card>
//           )}
//         </TabsContent>

//         <TabsContent value="inventory" className="space-y-6">
//           {inventoryReport ? (
//             <>
//               {/* Inventory Summary */}
//               <div className="grid gap-4 md:grid-cols-4">
//                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-sm font-medium">Total Products</CardTitle>
//                       <Package className="h-4 w-4 text-blue-600" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">{inventoryReport.summary?.totalProducts || 0}</div>
//                       <p className="text-xs text-muted-foreground">In inventory</p>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
//                       <DollarSign className="h-4 w-4 text-green-600" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">
//                         {formatCurrency(inventoryReport.summary?.totalCostValue || 0)}
//                       </div>
//                       <p className="text-xs text-muted-foreground">Cost value</p>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
//                       <TrendingUp className="h-4 w-4 text-purple-600" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">
//                         {formatCurrency(inventoryReport.summary?.totalSellValue || 0)}
//                       </div>
//                       <p className="text-xs text-muted-foreground">Sell value</p>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-sm font-medium">Potential Profit</CardTitle>
//                       <BarChart3 className="h-4 w-4 text-orange-600" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">
//                         {formatCurrency(inventoryReport.summary?.potentialProfit || 0)}
//                       </div>
//                       <p className="text-xs text-muted-foreground">If all sold</p>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//               </div>

//               {/* Low Stock Items */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Package className="h-5 w-5 text-orange-600" />
//                     Low Stock Alert
//                   </CardTitle>
//                   <CardDescription>
//                     {inventoryReport.summary?.lowStockCount || 0} items need restocking
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="rounded-md border">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Product</TableHead>
//                           <TableHead>Category</TableHead>
//                           <TableHead>Current Stock</TableHead>
//                           <TableHead>Status</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {inventoryReport.lowStockItems?.slice(0, 10).map((item) => (
//                           <TableRow key={item.stockId}>
//                             <TableCell>
//                               <div>
//                                 <div className="font-medium">{item.product?.productName || "-"}</div>
//                                 <div className="text-sm text-muted-foreground">{item.product?.productCode || "-"}</div>
//                               </div>
//                             </TableCell>
//                             <TableCell>{item.product?.category?.categoryName || "-"}</TableCell>
//                             <TableCell>{item.quantity || 0}</TableCell>
//                             <TableCell>
//                               <span
//                                 className={`px-2 py-1 rounded-full text-xs ${item.quantity === 0
//                                   ? "bg-red-100 text-red-800"
//                                   : item.quantity < 10
//                                     ? "bg-orange-100 text-orange-800"
//                                     : "bg-yellow-100 text-yellow-800"
//                                   }`}
//                               >
//                                 {item.quantity === 0 ? "Out of Stock" : item.quantity < 10 ? "Critical" : "Low Stock"}
//                               </span>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Recent Stock Entries */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <TrendingUp className="h-5 w-5" />
//                     Recent Stock Entries
//                   </CardTitle>
//                   <CardDescription>Latest inventory additions</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="rounded-md border">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Product</TableHead>
//                           <TableHead>Supplier</TableHead>
//                           <TableHead>Quantity</TableHead>
//                           <TableHead>Entry Price</TableHead>
//                           <TableHead>Date</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {inventoryReport.recentEntries?.slice(0, 10).map((entry) => (
//                           <TableRow key={entry.entryId}>
//                             <TableCell>{entry.product?.productName || "-"}</TableCell>
//                             <TableCell>{entry.supplier?.supplierName || "-"}</TableCell>
//                             <TableCell>{entry.quantity || 0}</TableCell>
//                             <TableCell>{formatCurrency(entry.entryPrice || 0)}</TableCell>
//                             <TableCell>{formatDate(entry.entryDate)}</TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 </CardContent>
//               </Card>
//             </>
//           ) : (
//             <Card>
//               <CardContent className="pt-6">
//                 <p className="text-muted-foreground">No inventory data available.</p>
//               </CardContent>
//             </Card>
//           )}
//         </TabsContent>

//         <TabsContent value="performance" className="space-y-6">
//           {salesReport ? (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Users className="h-5 w-5" />
//                   Employee Performance
//                 </CardTitle>
//                 <CardDescription>Sales performance by employee</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="rounded-md border">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Employee</TableHead>
//                         <TableHead>Department</TableHead>
//                         <TableHead>Total Sales</TableHead>
//                         <TableHead>Revenue</TableHead>
//                         <TableHead>Average Sale</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {salesReport.salesByEmployee?.map((employee) => (
//                         <TableRow key={employee.employeeId}>
//                           <TableCell>
//                             {employee.employee?.firstName || "-"} {employee.employee?.lastName || "-"}
//                           </TableCell>
//                           <TableCell>{employee.employee?.department?.departmentName || "-"}</TableCell>
//                           <TableCell>{employee._count || 0}</TableCell>
//                           <TableCell>{formatCurrency(employee._sum?.amount || 0)}</TableCell>
//                           <TableCell>
//                             {formatCurrency((employee._sum?.amount || 0) / (employee._count || 1))}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </CardContent>
//             </Card>
//           ) : (
//             <Card>
//               <CardContent className="pt-6">
//                 <p className="text-muted-foreground">No performance data available for the selected period.</p>
//               </CardContent>
//             </Card>
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

