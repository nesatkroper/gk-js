"use client";
export const dynamic = "force-dynamic";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Warehouse, AlertTriangle, TrendingUp, Package, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { useStockStore, useProductStore, useSupplierStore } from "@/stores";
import { usePermissions } from "@/hooks/use-permissions";

export default function InventoryPage() {
  const { t } = useTranslation("ui");
  const { items: stockEntries, isLoading, error, fetch, create, update, delete: deleteEntry } = useStockStore();
  const { items: products, isLoading: prodLoading, fetch: proFetch } = useProductStore();
  const { items: suppliers, isLoading: supLoading, fetch: supFetch } = useSupplierStore();
  const { canCreate, canUpdate, canDelete } = usePermissions();

  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entryDate, setEntryDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch({ search: searchTerm, lowStock: showLowStock });
    proFetch();
    supFetch();
  }, [fetch, proFetch, supFetch, searchTerm, showLowStock]);

  const filteredStocks = stockEntries.filter(
    (stock) =>
      stock.Product?.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.Product?.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.memo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleAddStock(formData) {
    if (!canCreate) {
      // toast({
      //   title: t("Permission Denied"),
      //   description: t("You do not have permission to create stock entries"),
      //   variant: "destructive",
      // });
      return;
    }

    setIsSubmitting(true);

    try {
      const stockData = {
        productId: formData.get("productId"),
        supplierId: formData.get("supplierId"),
        quantity: parseInt(formData.get("quantity")),
        entryPrice: formData.get("entryPrice"),
        entryDate: entryDate?.toISOString(),
        invoice: formData.get("invoice") || null,
        memo: formData.get("memo") || null,
        status: (formData.get("status")),
      };

      if (!stockData.productId) throw new Error(t("Product is required"));
      if (!stockData.supplierId) throw new Error(t("Supplier is required"));
      if (stockData.quantity <= 0) throw new Error(t("Quantity must be positive"));
      if (parseFloat(stockData.entryPrice) < 0) throw new Error(t("Entry price must be non-negative"));

      const success = await create(stockData);
      if (success) {
        // toast({
        //   title: t("Success"),
        //   description: t("Stock entry created successfully"),
        // });
        setIsAddDialogOpen(false);
        setEntryDate(new Date());
        router.refresh();
      } else {
        throw new Error(t("Failed to create stock entry"));
      }
    } catch (error) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to create stock entry"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditStock(formData) {
    if (!canUpdate) {
      // toast({
      //   title: t("Permission Denied"),
      //   description: t("You do not have permission to update stock entries"),
      //   variant: "destructive",
      // });
      return;
    }

    if (!selectedEntry) return;

    setIsSubmitting(true);

    try {
      const stockData = {
        productId: formData.get("productId"),
        supplierId: formData.get("supplierId"),
        quantity: parseInt(formData.get("quantity")),
        entryPrice: formData.get("entryPrice"),
        entryDate: entryDate?.toISOString(),
        invoice: formData.get("invoice") || null,
        memo: formData.get("memo") || null,
        status: formData.get("status"),
      };

      if (!stockData.productId) throw new Error(t("Product is required"));
      if (!stockData.supplierId) throw new Error(t("Supplier is required"));
      if (stockData.quantity <= 0) throw new Error(t("Quantity must be positive"));
      if (parseFloat(stockData.entryPrice) < 0) throw new Error(t("Entry price must be non-negative"));

      const success = await update(selectedEntry.entryId, stockData);
      if (success) {
        // toast({
        //   title: t("Success"),
        //   description: t("Stock entry updated successfully"),
        // });
        setIsEditDialogOpen(false);
        setSelectedEntry(null);
        setEntryDate(new Date());
        router.refresh();
      } else {
        throw new Error(t("Failed to update stock entry"));
      }
    } catch (error) {
      // toast({
      //   title: t("Error"),
      //   description: error.message || t("Failed to update stock entry"),
      //   variant: "destructive",
      // });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteStock = async (entryId) => {
    if (!canDelete) {
      // toast({
      //   title: t("Permission Denied"),
      //   description: t("You do not have permission to delete stock entries"),
      //   variant: "destructive",
      // });
      return;
    }

    if (!confirm(t("Are you sure you want to delete this stock entry?"))) return;

    // try {
    //   const success = await deleteEntry(entryId);
    //   // if (success) {
    //   //   toast({
    //   //     title: t("Success"),
    //   //     description: t("Stock entry deleted successfully"),
    //   //   });
    //   // } else {
    //   //   throw new Error(t("Failed to delete stock entry"));
    //   // }
    // } catch (error) {
    //   toast({
    //     title: t("Error"),
    //     description: error.message || t("Failed to delete stock entry"),
    //     variant: "destructive",
    //   });
    // }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { variant: "destructive", label: t("Out of Stock") };
    if (quantity < 5) return { variant: "destructive", label: t("Critical") };
    if (quantity < 50) return { variant: "secondary", label: t("Low Stock") };
    return { variant: "default", label: t("In Stock") };
  };

  const lowStockCount = stockEntries.filter((stock) => stock.quantity < 50).length;
  const outOfStockCount = stockEntries.filter((stock) => stock.quantity === 0).length;
  const totalValue = stockEntries
    .reduce((sum, stock) => sum + stock.quantity * stock.entryPrice, 0)
    .toFixed(2);

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

        {canCreate && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={prodLoading || supLoading}>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Stock Entry")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{t("Add Stock Entry")}</DialogTitle>
                <DialogDescription>{t("Record new inventory received from supplier")}</DialogDescription>
              </DialogHeader>
              <form action={handleAddStock} className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productId">{t("Product")} *</Label>
                    <Select name="productId" required disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select product")} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.productId} value={product.productId}>
                            {product.productName} {product.productCode && `(${product.productCode})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplierId">{t("Supplier")} *</Label>
                    <Select name="supplierId" required disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select supplier")} />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.supplierId} value={supplier.supplierId}>
                            {supplier.supplierName} {supplier.companyName && `(${supplier.companyName})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">{t("Quantity")} *</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entryPrice">{t("Entry Price")} *</Label>
                    <Input
                      id="entryPrice"
                      name="entryPrice"
                      type="number"
                      step="0.01"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entryDate">{t("Entry Date")}</Label>
                    <DatePicker
                      date={entryDate}
                      onDateChange={setEntryDate}
                      placeholder={t("Select entry date")}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice">{t("Invoice Number")}</Label>
                    <Input id="invoice" name="invoice" disabled={isSubmitting} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memo">{t("Notes")}</Label>
                  <Textarea id="memo" name="memo" rows={3} disabled={isSubmitting} />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    {t("Cancel")}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("Processing...")}
                      </>
                    ) : (
                      t("Add Entry")
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {(error || prodLoading || supLoading) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">{t("Error loading data")}</p>
                <p className="text-sm text-muted-foreground">{error || t("Loading products or suppliers")}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  fetch({ search: searchTerm, lowStock: showLowStock });
                  proFetch();
                  supFetch();
                }}
                disabled={isLoading || prodLoading || supLoading}
              >
                {t("Try Again")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Total Entries")}</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockEntries.length}</div>
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
              <CardTitle className="text-sm font-medium">{t("Out of Stock")}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outOfStockCount}</div>
              <p className="text-xs text-muted-foreground">{t("Entries with 0 units")}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Total Value")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue}</div>
              <p className="text-xs text-muted-foreground">{t("Estimated inventory value")}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            {t("Stock Levels")}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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
                disabled={isLoading || prodLoading || supLoading}
              />
            </div>
            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
              disabled={isLoading || prodLoading || supLoading}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {showLowStock ? t("Show All") : t("Low Stock Only")}
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Product")}</TableHead>
                  <TableHead>{t("Supplier")}</TableHead>
                  <TableHead>{t("Category")}</TableHead>
                  <TableHead>{t("Unit/Capacity")}</TableHead>
                  <TableHead>{t("Quantity")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead>{t("Entry Date")}</TableHead>
                  <TableHead className="text-right">{t("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => {
                  const status = getStockStatus(stock.quantity);
                  return (
                    <motion.tr
                      key={stock.entryId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{stock.Product?.productName || "N/A"}</div>
                          {stock.Product?.productCode && (
                            <div className="text-sm text-muted-foreground">{stock.Product.productCode}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{stock.Supplier?.supplierName || "N/A"}</TableCell>
                      <TableCell>{stock.Product?.Category?.categoryName || "N/A"}</TableCell>
                      <TableCell>
                        {stock.Product?.unit && stock.Product?.capacity != null
                          ? `${stock.Product.capacity} ${stock.Product.unit}`
                          : stock.Product?.unit || stock.Product?.capacity || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{stock.quantity}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(stock.entryDate || stock.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEntry(stock);
                              setEntryDate(stock.entryDate ? new Date(stock.entryDate) : new Date());
                              setIsEditDialogOpen(true);
                            }}
                            disabled={!canUpdate}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStock(stock.entryId)}
                            disabled={!canDelete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedEntry(null);
            setEntryDate(new Date());
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("Edit Stock Entry")}</DialogTitle>
            <DialogDescription>{t("Update inventory entry details")}</DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <form action={handleEditStock} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productId">{t("Product")} *</Label>
                <Select
                  name="productId"
                  defaultValue={selectedEntry.productId}
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select product")} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.productId} value={product.productId}>
                        {product.productName} {product.productCode && `(${product.productCode})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierId">{t("Supplier")} *</Label>
                <Select
                  name="supplierId"
                  defaultValue={selectedEntry.supplierId}
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select supplier")} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.supplierId} value={supplier.supplierId}>
                        {supplier.supplierName} {supplier.companyName && `(${supplier.companyName})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">{t("Quantity")} *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue={selectedEntry.quantity}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entryPrice">{t("Entry Price")} *</Label>
                  <Input
                    id="entryPrice"
                    name="entryPrice"
                    type="number"
                    step="0.01"
                    defaultValue={selectedEntry.entryPrice}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryDate">{t("Entry Date")}</Label>
                  <DatePicker
                    date={entryDate}
                    onDateChange={setEntryDate}
                    placeholder={t("Select entry date")}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice">{t("Invoice Number")}</Label>
                  <Input
                    id="invoice"
                    name="invoice"
                    defaultValue={selectedEntry.invoice || ""}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo">{t("Notes")}</Label>
                <Textarea
                  id="memo"
                  name="memo"
                  rows={3}
                  defaultValue={selectedEntry.memo || ""}
                  disabled={isSubmitting}
                />
                <Label htmlFor="status">{t("Status")}</Label>
                <Select
                  name="status"
                  defaultValue={selectedEntry.status}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("Active")}</SelectItem>
                    <SelectItem value="inactive">{t("Inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedEntry(null);
                    setEntryDate(new Date());
                  }}
                  disabled={isSubmitting}
                >
                  {t("Cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("Updating...")}
                    </>
                  ) : (
                    t("Update Entry")
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Plus, Search, Warehouse, AlertTriangle, TrendingUp, Package, Edit, Trash2 } from "lucide-react";
// import { formatDate } from "@/lib/utils";
// import { useStockStore } from "@/stores/stock-store";
// import { useProductStore, useSupplierStore } from "@/stores";
// import { Entry } from "@/lib/generated/prisma";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DatePicker } from "@/components/ui/date-picker"
// import { Textarea } from "@/components/ui/textarea";



// export default function InventoryPage() {
//   const { items: stockEntries, isLoading, error, fetch, create, update, delete: deleteEntry } = useStockStore();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showLowStock, setShowLowStock] = useState(false);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
//   const [entryDate, setEntryDate] = useState<Date | undefined>(new Date());
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const { items: products, fetch: proFetch } = useProductStore()
//   const { items: suppliers, fetch: supFetch } = useSupplierStore()

//   useEffect(() => {
//     fetch({ search: searchTerm, lowStock: showLowStock });
//     proFetch()
//     supFetch()
//   }, [fetch, proFetch, supFetch, searchTerm, showLowStock]);



//   const filteredStocks = stockEntries.filter(
//     (stock) =>
//       stock.Product?.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stock.Product?.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stock.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stock.memo?.toLowerCase().includes(searchTerm.toLowerCase()),
//   );

//   const handleAddStock = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);

//     setIsSubmitting(true);

//     const stockData: Partial<Entry> = {
//       productId: formData.get("productId") as string,
//       supplierId: formData.get("supplierId") as string,
//       quantity: Number.parseInt(formData.get("quantity") as string),
//       entryPrice: Number.parseFloat(formData.get("entryPrice") as string),
//       entryDate: entryDate,
//       invoice: formData.get("invoice") as string,
//       memo: formData.get("memo") as string,
//       status: (formData.get("status") as "active" | "inactive") || "active",
//     };

//     try {
//       await create(stockData);
//       setIsAddDialogOpen(false);
//       (e.target as HTMLFormElement).reset();
//     } catch (error) {
//       console.error("Error adding stock:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleEditStock = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!selectedEntry) return;

//     const formData = new FormData(e.currentTarget);
//     const stockData: Partial<Entry> = {
//       productId: formData.get("productId") as string,
//       supplierId: formData.get("supplierId") as string,
//       quantity: Number.parseInt(formData.get("quantity") as string),
//       entryPrice: Number.parseFloat(formData.get("entryPrice") as string),
//       entryDate: formData.get("entryDate") as string,
//       invoice: formData.get("invoice") as string,
//       memo: formData.get("memo") as string,
//       status: formData.get("status") as "active" | "inactive",
//     };

//     try {
//       await update(selectedEntry.entryId, stockData);
//       setIsEditDialogOpen(false);
//       setSelectedEntry(null);
//     } catch (error) {
//       console.error("Error updating stock:", error);
//     }
//   };

//   const handleDeleteStock = async (entryId: string) => {
//     if (!window.confirm("Are you sure you want to delete this stock entry?")) return;
//     try {
//       await deleteEntry(entryId);
//     } catch (error) {
//       console.error("Error deleting stock:", error);
//     }
//   };

//   const getStockStatus = (quantity: number) => {
//     if (quantity === 0) return { variant: "destructive" as const, label: "Out of Stock" };
//     if (quantity < 10) return { variant: "destructive" as const, label: "Critical" };
//     if (quantity < 50) return { variant: "secondary" as const, label: "Low Stock" };
//     return { variant: "default" as const, label: "In Stock" };
//   };

//   const lowStockCount = stockEntries.filter((stock) => stock.quantity < 50).length;
//   const outOfStockCount = stockEntries.filter((stock) => stock.quantity === 0).length;
//   const totalValue = stockEntries.reduce((sum, stock) => sum + stock.quantity * stock.entryPrice, 0).toFixed(2);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
//           <p className="text-muted-foreground">Monitor stock levels and manage inventory entries</p>
//         </div>

//         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               Add Stock Entry
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[600px]">
//             <DialogHeader>
//               <DialogTitle>Add Stock Entry</DialogTitle>
//               <DialogDescription>Record new inventory received from supplier</DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleAddStock} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="productId">Product</Label>
//                 <Select name="productId" required>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select product" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {products.map((product) => (
//                       <SelectItem key={product.productId} value={product.productId}>
//                         {product.productName} {product.productCode && `(${product.productCode})`}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="supplierId">Supplier</Label>
//                 <Select name="supplierId" required>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select supplier" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {suppliers.map((supplier) => (
//                       <SelectItem key={supplier.supplierId} value={supplier.supplierId}>
//                         {supplier.supplierName} {supplier.companyName && `(${supplier.companyName})`}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="quantity">Quantity</Label>
//                   <Input id="quantity" name="quantity" type="number" min="1" required />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="entryPrice">Entry Price</Label>
//                   <Input id="entryPrice" name="entryPrice" type="number" step="0.01" required />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="entryDate">Entry Date</Label>
//                   <DatePicker
//                     date={entryDate}
//                     onDateChange={setEntryDate}
//                     placeholder="Select date of birth"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="invoice">Invoice Number</Label>
//                   <Input id="invoice" name="invoice" />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="memo">Notes</Label>
//                 <Textarea id="memo" name="memo" rows={3} />
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={isSubmitting}>
//                   {isSubmitting ? "Processing..." : "Add Entry"}
//                 </Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </motion.div>

//       <Dialog
//         open={isEditDialogOpen}
//         onOpenChange={() => {
//           setIsEditDialogOpen(false);
//           setSelectedEntry(null);
//         }}
//       >
//         <DialogContent className="sm:max-w-[600px]">
//           <DialogHeader>
//             <DialogTitle>Edit Stock Entry</DialogTitle>
//             <DialogDescription>Update inventory entry details</DialogDescription>
//           </DialogHeader>
//           {selectedEntry && (
//             <form onSubmit={handleEditStock} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="productId">Product</Label>
//                 <Select name="productId" defaultValue={selectedEntry?.productId} required>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select product" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {products.map((product) => (
//                       <SelectItem key={product.productId} value={product.productId}>
//                         {product.productName} {product.productCode && `(${product.productCode})`}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="supplierId">Supplier</Label>
//                 <Select name="supplierId" defaultValue={selectedEntry.supplierId} required>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select supplier" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {suppliers.map((supplier) => (
//                       <SelectItem key={supplier.supplierId} value={supplier.supplier.supplierId}>
//                         {supplier.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="quantity">Quantity</Label>
//                   <Input
//                     id="quantity"
//                     name="quantity"
//                     type="number"
//                     min="1"
//                     defaultValue={selectedEntry.quantity}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="entryPrice">Entry Price</Label>
//                   <Input
//                     name="entryPrice"
//                     type="number"
//                     step="0.01"
//                     defaultValue={selectedEntry.entryPrice}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="entryDate">Entry Date</Label>
//                   <Input
//                     name="type"
//                     type="date"
//                     defaultValue={selectedEntry.entryDate?.split("T")[0]}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="invoice">Invoice Number</Label>
//                   <Input id="invoice" name="invoice" defaultValue={selectedEntry.invoice || ""} />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="memo">Notes</Label>
//                 <Textarea id="memo" name="memo" rows={3} defaultValue={selectedEntry.memo || ""} />
//                 <Label htmlFor="status">Status</Label>
//                 <Select name="status" defaultValue={selectedEntry.status}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="active">Active</SelectItem>
//                     <SelectItem value="inactive">Inactive</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button type="button" variant="outline" onClick={() => {
//                   setIsEditDialogOpen(false);
//                   setSelectedEntry(null);
//                 }}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">Update Entry</Button>
//               </div>
//             </form>
//           )}
//         </DialogContent>
//       </Dialog>

//       <div className="grid gap-4 md:grid-cols-4">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//         >
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
//               <Package className="h-4 w-4 text-blue-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stockEntries.length}</div>
//               <p className="text-xs text-muted-foreground">Stock entries in inventory</p>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
//               <AlertTriangle className="h-4 w-4 text-orange-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{lowStockCount}</div>
//               <p className="text-xs text-muted-foreground">Entries below 50 units</p>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//         >
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
//               <AlertTriangle className="h-4 w-4 text-red-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{outOfStockCount}</div>
//               <p className="text-xs text-muted-foreground">Entries with 0 units</p>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//         >
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Value</CardTitle>
//               <TrendingUp className="h-4 w-4 text-green-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">${totalValue}</div>
//               <p className="text-xs text-muted-foreground">Estimated inventory value</p>
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Warehouse className="h-5 w-5" />
//             Stock Levels
//           </CardTitle>
//           <CardDescription>{filteredStocks.length} stock entries in inventory</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search inventory..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <Button
//               variant={showLowStock ? "default" : "outline"}
//               onClick={() => setShowLowStock(!showLowStock)}
//             >
//               <AlertTriangle className="mr-2 h-4 w-4" />
//               {showLowStock ? "Show All" : "Low Stock Only"}
//             </Button>
//           </div>

//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Product</TableHead>
//                   <TableHead>Supplier</TableHead>
//                   <TableHead>Category</TableHead>
//                   <TableHead>Unit/Capacity</TableHead>
//                   <TableHead>Quantity</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Entry Date</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredStocks.map((stock) => {
//                   const status = getStockStatus(stock.quantity);
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
//                       <TableCell>{stock.Supplier?.name || "N/A"}</TableCell>
//                       <TableCell>{stock.Product?.category?.categoryName || "N/A"}</TableCell>
//                       <TableCell>
//                         {stock.Product?.unit && stock.Product?.capacity
//                           ? `${Number(stock.Product.capacity)} ${stock.Product.unit}`
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
//                               setSelectedEntry(stock);
//                               setIsEditDialogOpen(true);
//                             }}
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleDeleteStock(stock.entryId)}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </motion.tr>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

