
"use client"


import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ViewToggle } from "@/components/ui/view-toggle"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { Plus, Search, Truck, Loader2, RefreshCw, Phone, Mail, Building } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSupplierStore } from "@/stores/supplier-store"

export const dynamic = 'force-dynamic';
export default function SuppliersPage() {
  const {
    items: suppliers,
    isLoading,
    error,
    fetch,
    create,
    update,
    delete: deleteSupplier,
  } = useSupplierStore()

  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState("table")
  const [editingSupplier, setEditingSupplier] = useState(null)

  useEffect(() => {
    fetch()
  }, [fetch])

  const activeSuppliers = suppliers.filter((sup) => sup.status === "active")

  const filteredSuppliers = activeSuppliers.filter(
    (supplier) =>
      supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Table columns configuration
  const tableColumns = [
    {
      key: "supplierName",
      label: "Supplier",
    },
    {
      key: "contact",
      label: "Contact",
      render: (_value, row) => (
        <div className="space-y-1">
          {row.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3" />
              {row.phone}
            </div>
          )}
          {row.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              {row.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "companyName",
      label: "Company",
      render: (value) => value || "-",
    },
    {
      key: "_count.entry",
      label: "Deliveries",
      type: "badge",
      render: (_value, row) => row._count?.entry || 0,
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
    },
    {
      key: "createdAt",
      label: "Created",
      type: "date",
    },
  ]

  // Card fields configuration
  const cardFields = [
    {
      key: "supplierName",
      primary: true,
    },
    {
      key: "companyName",
      label: "Company",
      secondary: true,
      render: (value) => value || "-",
    },
    {
      key: "contact",
      label: "Contact Info",
      render: (_value, row) => (
        <div className="space-y-1">
          {row.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-4 w-4" />
              {row.phone}
            </div>
          )}
          {row.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-4 w-4" />
              {row.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "_count.entry",
      label: "Deliveries",
      type: "badge",
      render: (_value, row) => row._count?.entry || 0,
    },
    {
      key: "memo",
      label: "Notes",
      render: (value) => value || "-",
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
    },
    {
      key: "createdAt",
      label: "Created",
      type: "date",
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const supplierData = {
      supplierName: formData.get("supplierName"),
      companyName: formData.get("companyName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      memo: formData.get("memo"),
    }

    setIsSaving(true)
    try {
      const success = editingSupplier
        ? await update(editingSupplier.supplierId, supplierData)
        : await create(supplierData)
      setIsSaving(false)

      if (success) {
        toast({
          title: "Success",
          description: `Supplier ${editingSupplier ? "updated" : "created"} successfully`,
        })
        setIsDialogOpen(false)
        setEditingSupplier(null)
          ; (e.target).reset()
      } else {
        throw new Error("Supplier operation failed")
      }
    } catch (error) {
      setIsSaving(false)
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingSupplier ? "update" : "create"} supplier`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier)
    setIsDialogOpen(true)
  }

  const handleDelete = async (supplierId) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return

    const success = await deleteSupplier(supplierId)
    if (success) {
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    fetch()
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier relationships and procurement contacts</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) setEditingSupplier(null)
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
                <DialogDescription>
                  {editingSupplier ? "Update supplier details" : "Create a new supplier record"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplierName">Supplier Name *</Label>
                    <Input
                      id="supplierName"
                      name="supplierName"
                      required
                      defaultValue={editingSupplier?.supplierName || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      defaultValue={editingSupplier?.companyName || ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={editingSupplier?.phone || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingSupplier?.email || ""}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memo">Notes</Label>
                  <Textarea
                    id="memo"
                    name="memo"
                    rows={3}
                    defaultValue={editingSupplier?.memo || ""}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingSupplier ? "Updating..." : "Creating..."}
                      </>
                    ) : editingSupplier ? (
                      "Update Supplier"
                    ) : (
                      "Create Supplier"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">Error loading data</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={handleRetry}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Supplier Directory
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredSuppliers.length} suppliers in your network</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredSuppliers}
              fields={cardFields}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="supplierId"
              nameField="supplierName"
              columns={3}
            />
          ) : (
            <DataTable
              data={filteredSuppliers}
              columns={tableColumns}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="supplierId"
              nameField="supplierName"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
