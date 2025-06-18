// paymentsPage.jsx (or whatever your component file is named)
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, DollarSign, CreditCard, Banknote, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslation } from "react-i18next"; // Import useTranslation

export const dynamic = 'force-dynamic';

export default function PaymentsPage() {
  const { t } = useTranslation('common'); // Initialize useTranslation

  const [payments, setPayments] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchSales();
  }, [filterType]);

  const fetchPayments = async () => {
    try {
      const url = filterType === "all" ? "/api/payments" : `/api/payments?type=${filterType}`;
      const response = await fetch(url);
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/sales");
      const data = await response.json();
      setSales(data.sales || []);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.sale.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.sale.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.sale.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddPayment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const paymentData = {
      saleId: formData.get("saleId"),
      amount: Number.parseFloat(formData.get("amount")),
      type: formData.get("type"),
      method: formData.get("method"),
      reference: formData.get("reference"),
      note: formData.get("note"),
      paymentDate: formData.get("paymentDate"),
    };

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        fetchPayments();
        e.target.reset(); // Corrected line
      }
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  const getPaymentTypeBadge = (type) => {
    const variants = {
      payment: "default",
      refund: "destructive",
      partial: "secondary",
    };

    return <Badge variant={variants[type] || "default"}>{t(type)}</Badge>; // Translated
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case "cash":
        return <Banknote className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "bank":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  // Calculate stats
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const todayPayments = payments.filter((payment) => {
    const today = new Date().toDateString();
    return new Date(payment.paymentDate).toDateString() === today;
  });
  const todayTotal = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const refunds = payments.filter((p) => p.type === "refund");
  const totalRefunds = refunds.reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('Payments')}</h1>
          <p className="text-muted-foreground">{t('Track and manage payment transactions')}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('Record Payment')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('Record Payment')}</DialogTitle>
              <DialogDescription>{t('Record a new payment transaction')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="saleId">{t('Sale/Invoice')}</Label>
                <Select name="saleId" required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select sale')} />
                  </SelectTrigger>
                  <SelectContent>
                    {sales.map((sale) => (
                      <SelectItem key={sale.saleId} value={sale.saleId}>
                        {sale.invoice || `${t('Sale')} #${sale.saleId.slice(-6)}`} - {sale.customer.firstName}{" "}
                        {sale.customer.lastName} ({formatCurrency(sale.amount)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t('Amount')}</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t('Type')}</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">{t('Payment')}</SelectItem>
                      <SelectItem value="refund">{t('Refund')}</SelectItem>
                      <SelectItem value="partial">{t('Partial Payment')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="method">{t('Payment Method')}</Label>
                  <Select name="method" required>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select method')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t('Cash')}</SelectItem>
                      <SelectItem value="card">{t('Credit/Debit Card')}</SelectItem>
                      <SelectItem value="bank">{t('Bank Transfer')}</SelectItem>
                      <SelectItem value="check">{t('Check')}</SelectItem>
                      <SelectItem value="other">{t('Other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">{t('Payment Date')}</Label>
                  <Input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">{t('Reference Number')}</Label>
                <Input id="reference" name="reference" placeholder={t('Transaction ID, Check number, etc.')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">{t('Notes')}</Label>
                <Textarea id="note" name="note" rows={3} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('Cancel')}
                </Button>
                <Button type="submit">{t('Record Payment')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Payment Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Payments')}</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPayments)}</div>
              <p className="text-xs text-muted-foreground">{t('All time payments')}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Today\'s Payments')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(todayTotal)}</div>
              <p className="text-xs text-muted-foreground">{t('{{count}} transactions', { count: todayPayments.length })}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Refunds')}</CardTitle>
              <CreditCard className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRefunds)}</div>
              <p className="text-xs text-muted-foreground">{t('{{count}} refunds', { count: refunds.length })}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Net Revenue')}</CardTitle>
              <Banknote className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPayments - totalRefunds)}</div>
              <p className="text-xs text-muted-foreground">{t('After refunds')}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('Payment History')}
          </CardTitle>
          <CardDescription>{t('{{count}} payment transactions', { count: filteredPayments.length })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('Search payments...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Types')}</SelectItem>
                <SelectItem value="payment">{t('Payments')}</SelectItem>
                <SelectItem value="refund">{t('Refunds')}</SelectItem>
                <SelectItem value="partial">{t('Partial')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Invoice')}</TableHead>
                  <TableHead>{t('Customer')}</TableHead>
                  <TableHead>{t('Amount')}</TableHead>
                  <TableHead>{t('Type')}</TableHead>
                  <TableHead>{t('Method')}</TableHead>
                  <TableHead>{t('Reference')}</TableHead>
                  <TableHead>{t('Date')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <motion.tr
                    key={payment.paymentId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <TableCell>
                      <div className="font-medium">{payment.sale.invoice || `${t('Sale')} #${payment.sale.saleId.slice(-6)}`}</div>
                    </TableCell>
                    <TableCell>
                      {payment.sale.customer.firstName} {payment.sale.customer.lastName}
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${payment.type === "refund" ? "text-red-600" : "text-green-600"}`}>
                        {payment.type === "refund" ? "-" : ""}
                        {formatCurrency(payment.amount)}
                      </div>
                    </TableCell>
                    <TableCell>{getPaymentTypeBadge(payment.type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.method)}
                        <span className="capitalize">{t(payment.method)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{payment.reference || "-"}</div>
                    </TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === "completed" ? "default" : "secondary"}>{t(payment.status)}</Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// "use client"


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
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Plus, Search, DollarSign, CreditCard, Banknote, TrendingUp } from "lucide-react"
// import { formatCurrency, formatDate } from "@/lib/utils"



// export const dynamic = 'force-dynamic';
// export default function PaymentsPage() {
//   const [payments, setPayments] = useState([])
//   const [sales, setSales] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [filterType, setFilterType] = useState("all")
//   const [isDialogOpen, setIsDialogOpen] = useState(false)

//   useEffect(() => {
//     fetchPayments()
//     fetchSales()
//   }, [filterType])

//   const fetchPayments = async () => {
//     try {
//       const url = filterType === "all" ? "/api/payments" : `/api/payments?type=${filterType}`
//       const response = await fetch(url)
//       const data = await response.json()
//       setPayments(data.payments || [])
//     } catch (error) {
//       console.error("Error fetching payments:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchSales = async () => {
//     try {
//       const response = await fetch("/api/sales")
//       const data = await response.json()
//       setSales(data.sales || [])
//     } catch (error) {
//       console.error("Error fetching sales:", error)
//     }
//   }

//   const filteredPayments = payments.filter(
//     (payment) =>
//       payment.sale.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       payment.sale.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       payment.sale.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   const handleAddPayment = async (e) => {
//     e.preventDefault()
//     const formData = new FormData(e.currentTarget)

//     const paymentData = {
//       saleId: formData.get("saleId"),
//       amount: Number.parseFloat(formData.get("amount")),
//       type: formData.get("type"),
//       method: formData.get("method"),
//       reference: formData.get("reference"),
//       note: formData.get("note"),
//       paymentDate: formData.get("paymentDate"),
//     }

//     try {
//       const response = await fetch("/api/payments", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(paymentData),
//       })

//       if (response.ok) {
//         setIsDialogOpen(false)
//         fetchPayments()
//           ; (e.targe).reset()
//       }
//     } catch (error) {
//       console.error("Error adding payment:", error)
//     }
//   }

//   const getPaymentTypeBadge = (type) => {
//     const variants = {
//       payment: "default",
//       refund: "destructive",
//       partial: "secondary",
//     }

//     return <Badge variant={variants[type] || "default"}>{type}</Badge>
//   }

//   const getMethodIcon = (method) => {
//     switch (method) {
//       case "cash":
//         return <Banknote className="h-4 w-4" />
//       case "card":
//         return <CreditCard className="h-4 w-4" />
//       case "bank":
//         return <DollarSign className="h-4 w-4" />
//       default:
//         return <DollarSign className="h-4 w-4" />
//     }
//   }

//   // Calculate stats
//   const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0)
//   const todayPayments = payments.filter((payment) => {
//     const today = new Date().toDateString()
//     return new Date(payment.paymentDate).toDateString() === today
//   })
//   const todayTotal = todayPayments.reduce((sum, payment) => sum + payment.amount, 0)
//   const refunds = payments.filter((p) => p.type === "refund")
//   const totalRefunds = refunds.reduce((sum, payment) => sum + payment.amount, 0)

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
//           <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
//           <p className="text-muted-foreground">Track and manage payment transactions</p>
//         </div>

//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               Record Payment
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[600px]">
//             <DialogHeader>
//               <DialogTitle>Record Payment</DialogTitle>
//               <DialogDescription>Record a new payment transaction</DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleAddPayment} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="saleId">Sale/Invoice</Label>
//                 <Select name="saleId" required>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select sale" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {sales.map((sale) => (
//                       <SelectItem key={sale.saleId} value={sale.saleId}>
//                         {sale.invoice || `Sale #${sale.saleId.slice(-6)}`} - {sale.customer.firstName}{" "}
//                         {sale.customer.lastName} ({formatCurrency(sale.amount)})
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="amount">Amount</Label>
//                   <Input id="amount" name="amount" type="number" step="0.01" required />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="type">Type</Label>
//                   <Select name="type" required>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="payment">Payment</SelectItem>
//                       <SelectItem value="refund">Refund</SelectItem>
//                       <SelectItem value="partial">Partial Payment</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="method">Payment Method</Label>
//                   <Select name="method" required>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select method" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="cash">Cash</SelectItem>
//                       <SelectItem value="card">Credit/Debit Card</SelectItem>
//                       <SelectItem value="bank">Bank Transfer</SelectItem>
//                       <SelectItem value="check">Check</SelectItem>
//                       <SelectItem value="other">Other</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="paymentDate">Payment Date</Label>
//                   <Input
//                     id="paymentDate"
//                     name="paymentDate"
//                     type="date"
//                     defaultValue={new Date().toISOString().split("T")[0]}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="reference">Reference Number</Label>
//                 <Input id="reference" name="reference" placeholder="Transaction ID, Check number, etc." />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="note">Notes</Label>
//                 <Textarea id="note" name="note" rows={3} />
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">Record Payment</Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </motion.div>

//       {/* Payment Stats */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
//               <DollarSign className="h-4 w-4 text-green-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{formatCurrency(totalPayments)}</div>
//               <p className="text-xs text-muted-foreground">All time payments</p>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Today's Payments</CardTitle>
//               <TrendingUp className="h-4 w-4 text-blue-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{formatCurrency(todayTotal)}</div>
//               <p className="text-xs text-muted-foreground">{todayPayments.length} transactions</p>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
//               <CreditCard className="h-4 w-4 text-red-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{formatCurrency(totalRefunds)}</div>
//               <p className="text-xs text-muted-foreground">{refunds.length} refunds</p>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
//               <Banknote className="h-4 w-4 text-purple-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{formatCurrency(totalPayments - totalRefunds)}</div>
//               <p className="text-xs text-muted-foreground">After refunds</p>
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <DollarSign className="h-5 w-5" />
//             Payment History
//           </CardTitle>
//           <CardDescription>{filteredPayments.length} payment transactions</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search payments..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <Select value={filterType} onValueChange={setFilterType}>
//               <SelectTrigger className="w-40">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Types</SelectItem>
//                 <SelectItem value="payment">Payments</SelectItem>
//                 <SelectItem value="refund">Refunds</SelectItem>
//                 <SelectItem value="partial">Partial</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Invoice</TableHead>
//                   <TableHead>Customer</TableHead>
//                   <TableHead>Amount</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Method</TableHead>
//                   <TableHead>Reference</TableHead>
//                   <TableHead>Date</TableHead>
//                   <TableHead>Status</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredPayments.map((payment) => (
//                   <motion.tr
//                     key={payment.paymentId}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="group"
//                   >
//                     <TableCell>
//                       <div className="font-medium">{payment.sale.invoice || `#${payment.sale.saleId.slice(-6)}`}</div>
//                     </TableCell>
//                     <TableCell>
//                       {payment.sale.customer.firstName} {payment.sale.customer.lastName}
//                     </TableCell>
//                     <TableCell>
//                       <div className={`font-medium ${payment.type === "refund" ? "text-red-600" : "text-green-600"}`}>
//                         {payment.type === "refund" ? "-" : ""}
//                         {formatCurrency(payment.amount)}
//                       </div>
//                     </TableCell>
//                     <TableCell>{getPaymentTypeBadge(payment.type)}</TableCell>
//                     <TableCell>
//                       <div className="flex items-center gap-2">
//                         {getMethodIcon(payment.method)}
//                         <span className="capitalize">{payment.method}</span>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <div className="text-sm">{payment.reference || "-"}</div>
//                     </TableCell>
//                     <TableCell>{formatDate(payment.paymentDate)}</TableCell>
//                     <TableCell>
//                       <Badge variant={payment.status === "completed" ? "default" : "secondary"}>{payment.status}</Badge>
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
