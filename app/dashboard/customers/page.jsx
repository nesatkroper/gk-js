

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ViewToggle } from "@/components/ui/view-toggle"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { Plus, Search, Users, Loader2, RefreshCw, Phone, Mail } from "lucide-react"
import { useCustomerStore } from "@/stores/customer-store"
import { useEmployeeStore } from "@/stores/employee-store"
import { t } from "i18next"

export default function CustomersPage() {
  const {
    items: customers,
    isLoading: custLoading,
    error: custError,
    fetch: fetchCustomers,
    create,
    update,
    delete: deleteCustomer,
  } = useCustomerStore()

  const {
    items: employees,
    isLoading: empLoading,
    error: empError,
    fetch: fetchEmployees,
  } = useEmployeeStore()

  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState("table")
  const [editingCustomer, setEditingCustomer] = useState(null)

  useEffect(() => {
    fetchCustomers()
    fetchEmployees()
  }, [fetchCustomers, fetchEmployees])

  const activeCustomers = customers.filter((cust) => cust.status === "active")

  const filteredCustomers = activeCustomers.filter(
    (customer) =>
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Table columns configuration
  const tableColumns = [
    {
      key: "name",
      label: "Customer",
      render: (_value, row) => (
        <div>
          <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
          <div className="text-sm text-muted-foreground capitalize">{row.gender}</div>
        </div>
      ),
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
          {row.CustomerInfo?.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              {row.CustomerInfo.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (_value, row) =>
        `${row.Address?.City?.name || row.CustomerInfo?.region || "-"}` +
        (row.Address?.State?.name ? `, ${row.Address.State.name}` : ""),
    },
    {
      key: "Employee",
      label: "Assigned To",
      render: (_value, row) =>
        row.Employee ? `${row.Employee.firstName} ${row.Employee.lastName}` : "-",
    },
    {
      key: "_count.Sale",
      label: "Sales",
      type: "badge",
      render: (_value, row) => row._count?.Sale || 0,
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
    },
    {
      key: "createdAt",
      label: "Joined",
      type: "date",
    },
  ]

  // Card fields configuration
  const cardFields = [
    {
      key: "name",
      primary: true,
      render: (_value, row) => `${row.firstName} ${row.lastName}`,
    },
    {
      key: "gender",
      label: "Gender",
      secondary: true,
      render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "-",
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
          {row.CustomerInfo?.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-4 w-4" />
              {row.CustomerInfo.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (_value, row) =>
        `${row.Address?.City?.name || row.CustomerInfo?.region || "-"}` +
        (row.Address?.State?.name ? `, ${row.Address.State.name}` : ""),
    },
    {
      key: "Employee",
      label: "Assigned To",
      render: (_value, row) =>
        row.Employee ? `${row.Employee.firstName} ${row.Employee.lastName}` : "-",
    },
    {
      key: "_count.Sale",
      label: "Sales",
      type: "badge",
      render: (_value, row) => row._count?.Sale || 0,
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
    },
    {
      key: "createdAt",
      label: "Joined",
      type: "date",
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const customerData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      gender: formData.get("gender"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      region: formData.get("region"),
      note: formData.get("note"),
      employeeId: formData.get("employeeId") || null,
    }

    setIsSaving(true)
    try {
      const success = editingCustomer
        ? await update(editingCustomer.customerId, customerData)
        : await create(customerData)
      setIsSaving(false)

      if (success) {

        setIsDialogOpen(false)
        setEditingCustomer(null)
          ; (e.target).reset()
      } else {
        throw new Error("Customer operation failed")
      }
    } catch (error) {
      setIsSaving(false)

    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleDelete = async (customerId) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    const success = await deleteCustomer(customerId)

  }

  const handleRetry = () => {
    fetchCustomers()
    fetchEmployees()
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{("Customers")}</h1>
          <p className="text-muted-foreground">{t("Manage your customer relationships and contact information")}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={custLoading || empLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${custLoading || empLoading ? "animate-spin" : ""}`} />
            {t("Refresh")}
          </Button>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) setEditingCustomer(null)
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={employees.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Customer")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                <DialogDescription>
                  {editingCustomer ? "Update customer details" : "Create a new customer record"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("First Name")} *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      defaultValue={editingCustomer?.firstName || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("Last Name")} *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      defaultValue={editingCustomer?.lastName || ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      name="gender"
                      defaultValue={editingCustomer?.gender || "male"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("Phone")}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={editingCustomer?.phone || ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("Email")}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingCustomer?.CustomerInfo?.email || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">{t("Region")}</Label>
                    <Input
                      id="region"
                      name="region"
                      defaultValue={editingCustomer?.CustomerInfo?.region || ""}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId">Assigned Employee</Label>
                  <Select
                    name="employeeId"
                  // defaultValue={editingCustomer?.employeeId || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t("None")}</SelectItem>
                      {employees?.map((employee) => (
                        <SelectItem key={employee.employeeId} value={employee.employeeId}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">{t("Notes")}</Label>
                  <Textarea
                    id="note"
                    name="note"
                    rows={3}
                    defaultValue={editingCustomer?.note || ""}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t("Cancel")}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingCustomer ? "Updating..." : "Creating..."}
                      </>
                    ) : editingCustomer ? (
                      "Update Customer"
                    ) : (
                      "Create Customer"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Error Display */}
      {(custError || empError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">{t("Error loading data")}</p>
                <p className="text-sm text-muted-foreground">{custError || empError}</p>
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
                <Users className="h-5 w-5" />
                {t("Customer Directory")}
                {(custLoading || empLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredCustomers.length} customers in your database</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredCustomers}
              fields={cardFields}
              loading={custLoading || empLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="customerId"
              nameField="firstName"
              columns={3}
            />
          ) : (
            <DataTable
              data={filteredCustomers}
              columns={tableColumns}
              loading={custLoading || empLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="customerId"
              nameField="firstName"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}


