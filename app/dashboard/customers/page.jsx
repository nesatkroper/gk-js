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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ViewToggle } from "@/components/ui/view-toggle"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { Plus, Search, User, Loader2, RefreshCw, Phone, Mail } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useFormHandler } from "@/hooks/use-form"
import { useCustomerStore } from "@/stores/customer-store"
import { useEmployeeStore } from "@/stores/employee-store"
import { createCustomer, updateCustomer, createCustomerInfo, updateCustomerInfo, deleteCustomer } from "@/app/actions/customers"
import { FormInput, FormTextArea, FormImageResize, FormImagePreview, FormDatePicker, FormComboBox } from "@/components/form"
import { usePermissions } from "@/hooks/use-permissions"
import { toast } from "sonner"

export const dynamic = 'force-dynamic'

export default function CustomersPage() {
  const { t } = useTranslation("common")
  const { canCreate, canUpdate, canDelete } = usePermissions()
  const {
    items: customers,
    isLoading: custLoading,
    error: custError,
    fetch: fetchCustomers,
  } = useCustomerStore()
  const {
    items: employees,
    isLoading: empLoading,
    error: empError,
    fetch: fetchEmployees,
  } = useEmployeeStore()

  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [customerFormError, setCustomerFormError] = useState(null)
  const [customerInfoFormError, setCustomerInfoFormError] = useState(null)

  const { formData: customerFormData, resetForm: resetCustomerForm, setFormData: setCustomerFormData, handleChange: handleCustomerChange, getSubmissionData: getCustomerSubmissionData } = useFormHandler({
    firstName: "",
    lastName: "",
    gender: "male",
    phone: "",
    status: "active",
    employeeId: "",
  })

  const { formData: customerInfoFormData, resetForm: resetCustomerInfoForm, setFormData: setCustomerInfoFormData, handleChange: handleCustomerInfoChange, handleImageData: handleCustomerInfoImageData, getSubmissionData: getCustomerInfoSubmissionData } = useFormHandler({
    picture: null,
    region: "",
    email: "",
    note: "",
    loyaltyPoints: 0,
    lastPurchaseDate: null,
    govId: "",
    govPicture: null,
    govExpire: null,
    status: "active",
  })

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchCustomers(),
        fetchEmployees(),
      ])
    }
    loadData()
  }, [fetchCustomers, fetchEmployees])

  const activeCustomers = customers.filter((cust) => cust.status === "active")

  const filteredCustomers = activeCustomers.filter(
    (customer) =>
      customer.firstName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      (customer.phone?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false) ||
      (customer.Customerinfo?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false)
  )

  const tableColumns = [
    {
      key: "name",
      label: t("Customer"),
      render: (_value, row) => (
        <div>
          <div className="font-medium">{`${row.firstName || ''} ${row.lastName || ''}`}</div>
        </div>
      ),
    },
    {
      key: "contact",
      label: t("Contact"),
      render: (_value, row) => (
        <div className="space-y-1">
          {row.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3" />
              {row.phone}
            </div>
          )}
          {row.Customerinfo?.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              {row.Customerinfo.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "Employee.name",
      label: t("Assigned Employee"),
      render: (_value, row) => row.Employee ? `${row.Employee.firstName || ''} ${row.Employee.lastName || ''}` : "-",
    },
    {
      key: "Customerinfo.loyaltyPoints",
      label: t("Loyalty Points"),
      render: (_value, row) => row.Customerinfo?.loyaltyPoints || 0,
    },
    {
      key: "Customerinfo.lastPurchaseDate",
      label: t("Last Purchase"),
      type: "date",
    },
    {
      key: "status",
      label: t("Status"),
      type: "badge",
    },
    {
      key: "createdAt",
      label: t("Created"),
      type: "date",
    },
    {
      key: "updatedAt",
      label: t("Updated"),
      type: "date",
    },
  ]

  const cardFields = [
    {
      key: "name",
      primary: true,
      render: (_value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
    },
    {
      key: "contact",
      label: t("Contact Info"),
      render: (_value, row) => (
        <div className="space-y-1">
          {row.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-4 w-4" />
              {row.phone}
            </div>
          )}
          {row.Customerinfo?.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-4 w-4" />
              {row.Customerinfo.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "Employee.name",
      label: t("Assigned Employee"),
      render: (_value, row) => row.Employee ? `${row.Employee.firstName || ''} ${row.Employee.lastName || ''}` : "-",
    },
    {
      key: "Customerinfo.loyaltyPoints",
      label: t("Loyalty Points"),
      render: (_value, row) => row.Customerinfo?.loyaltyPoints || 0,
    },
    {
      key: "Customerinfo.lastPurchaseDate",
      label: t("Last Purchase"),
      type: "date",
    },
    {
      key: "status",
      label: t("Status"),
      type: "badge",
    },
    {
      key: "createdAt",
      label: t("Created"),
      type: "date",
    },
    {
      key: "updatedAt",
      label: t("Updated"),
      type: "date",
    },
  ]

  async function handleCustomerSubmit(e) {
    e.preventDefault()
    setIsSaving(true)
    setCustomerFormError(null)

    try {
      const { data } = getCustomerSubmissionData()
      if (!data.firstName) throw new Error(t("First name is required"))
      if (!data.lastName) throw new Error(t("Last name is required"))

      const result = editingCustomer
        ? await updateCustomer(editingCustomer.customerId, data)
        : await createCustomer(data)

      if (!result.success) {
        throw new Error(result.error || t("Customer operation failed"))
      }

      toast.success(editingCustomer ? t("Customer updated successfully") : t("Customer created successfully"))

      if (!editingCustomer && result.customer.customerId) {
        setEditingCustomer(result.customer)
        setCustomerInfoFormData({
          ...customerInfoFormData,
          customerId: result.customer.customerId,
        })
      }

      await fetchCustomers()
    } catch (err) {
      console.error("Customer operation error:", err)
      setCustomerFormError(err.message || t("An error occurred"))
      toast.error(err.message || t("An error occurred"))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCustomerInfoSubmit(e) {
    e.preventDefault()
    setIsSaving(true)
    setCustomerInfoFormError(null)

    try {
      const { data, files } = getCustomerInfoSubmissionData()
      if (!editingCustomer) throw new Error(t("Create customer first"))

      console.log("Submitting customer info:", { data, pictureFile: files.picture?.name, govPictureFile: files.govPicture?.name })

      const result = editingCustomer.Customerinfo
        ? await updateCustomerInfo(editingCustomer.customerId, data, files.picture, files.govPicture)
        : await createCustomerInfo({
            ...data,
            customerId: editingCustomer.customerId,
          }, files.picture, files.govPicture)

      if (!result.success) {
        throw new Error(result.error || t("Customer info operation failed"))
      }

      toast.success(t("Customer info saved successfully"))
      setIsDialogOpen(false)
      setEditingCustomer(null)
      resetCustomerForm()
      resetCustomerInfoForm()
      await fetchCustomers()
    } catch (err) {
      console.error("Customer info operation error:", err)
      setCustomerInfoFormError(err.message || t("An error occurred"))
      toast.error(err.message || t("An error occurred"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (customer) => {
    if (!canUpdate) return
    setCustomerFormData({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      gender: customer.gender || "male",
      phone: customer.phone || "",
      status: customer.status || "active",
      employeeId: customer.employeeId || "",
    })
    setCustomerInfoFormData({
      picture: customer.Customerinfo?.picture || null,
      region: customer.Customerinfo?.region || "",
      email: customer.Customerinfo?.email || "",
      note: customer.Customerinfo?.note || "",
      loyaltyPoints: customer.Customerinfo?.loyaltyPoints || 0,
      lastPurchaseDate: customer.Customerinfo?.lastPurchaseDate ? new Date(customer.Customerinfo.lastPurchaseDate) : null,
      govId: customer.Customerinfo?.govId || "",
      govPicture: customer.Customerinfo?.govPicture || null,
      govExpire: customer.Customerinfo?.govExpire ? new Date(customer.Customerinfo.govExpire) : null,
      status: customer.Customerinfo?.status || "active",
    })
    setEditingCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleDelete = async (customerId) => {
    if (!canDelete) return
    if (!confirm(t("Are you sure you want to delete this customer?"))) return

    try {
      const result = await deleteCustomer(customerId)
      if (result.success) {
        toast.success(t("Customer deleted successfully"))
        await fetchCustomers()
      } else {
        throw new Error(result.error || t("Failed to delete customer"))
      }
    } catch (error) {
      console.error("Customer deletion error:", error)
      toast.error(error.message || t("Failed to delete customer"))
    }
  }

  const handleRetry = () => {
    fetchCustomers()
    fetchEmployees()
  }

  const handleDialogClose = (open) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingCustomer(null)
      resetCustomerForm()
      resetCustomerInfoForm()
      setCustomerFormError(null)
      setCustomerInfoFormError(null)
    }
  }

  const genderOptions = [
    { time: "male", less: t("Male") },
    { time: "female", less: t("Female") },
  ]

  const statusOptions = [
    { time: "active", less: t("Active") },
    { time: "inactive", less: t("Inactive") },
  ]

  const employeeOptions = employees.map((emp) => ({
    time: emp.employeeId,
    less: `${emp.firstName || ''} ${emp.lastName || ''}`,
  }))

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Customers")}</h1>
          <p className="text-muted-foreground">{t("Manage your customer information")}</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button variant="outline" onClick={handleRetry} disabled={custLoading || empLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${custLoading || empLoading ? "animate-spin" : ""}`} />
              {t("Refresh")}
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button disabled={custLoading || empLoading || !canCreate || employees.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Customer")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCustomer ? t("Edit Customer") : t("Add New Customer")}</DialogTitle>
                <DialogDescription>
                  {editingCustomer ? t("Update customer details") : t("Create a new customer record")}
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="customer" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="customer">{t("Customer Details")}</TabsTrigger>
                  <TabsTrigger value="customerInfo" disabled={!editingCustomer}>{t("Additional Info")}</TabsTrigger>
                </TabsList>
                <TabsContent value="customer">
                  <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    {customerFormError && (
                      <p className="text-red-500 text-sm">{customerFormError}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        name="firstName"
                        disabled={isSaving}
                        label={t("First Name")}
                        value={customerFormData.firstName}
                        placeholder={t("First Name")}
                        onCallbackInput={handleCustomerChange}
                        required
                        error={customerFormError && !customerFormData.firstName ? t("First name is required") : null}
                      />
                      <FormInput
                        name="lastName"
                        disabled={isSaving}
                        label={t("Last Name")}
                        value={customerFormData.lastName}
                        placeholder={t("Last Name")}
                        onCallbackInput={handleCustomerChange}
                        required
                        error={customerFormError && !customerFormData.lastName ? t("Last name is required") : null}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        name="phone"
                        disabled={isSaving}
                        label={t("Phone")}
                        value={customerFormData.phone}
                        placeholder={t("Phone")}
                        onCallbackInput={handleCustomerChange}
                        type="tel"
                      />
                      <FormComboBox
                        name="employeeId"
                        label={t("Assigned Employee")}
                        item={employeeOptions}
                        optID="time"
                        optLabel="less"
                        onCallbackSelect={(value) => handleCustomerChange("employeeId", value)}
                        defaultValue={customerFormData.employeeId}
                        disabled={isSaving || empLoading}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormComboBox
                        name="gender"
                        label={t("Gender")}
                        item={genderOptions}
                        optID="time"
                        optLabel="less"
                        onCallbackSelect={(value) => handleCustomerChange("gender", value)}
                        defaultValue={customerFormData.gender}
                        disabled={isSaving}
                      />
                      <FormComboBox
                        name="status"
                        label={t("Status")}
                        item={statusOptions}
                        optID="time"
                        optLabel="less"
                        onCallbackSelect={(value) => handleCustomerChange("status", value)}
                        defaultValue={customerFormData.status}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSaving}>
                        {t("Cancel")}
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingCustomer ? t("Updating...") : t("Creating...")}
                          </>
                        ) : editingCustomer ? (
                          t("Update Customer")
                        ) : (
                          t("Create Customer")
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                <TabsContent value="customerInfo">
                  <form onSubmit={handleCustomerInfoSubmit} className="space-y-4">
                    {customerInfoFormError && (
                      <p className="text-red-500 text-sm">{customerInfoFormError}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t("Picture")}</label>
                        <FormImageResize
                          onCallbackData={(data) => handleCustomerInfoImageData("picture", data)}
                          disabled={isSaving}
                        />
                        {customerInfoFormData.picture && (
                          <FormImagePreview
                            imgSrc={
                              customerInfoFormData.picture instanceof File
                                ? URL.createObjectURL(customerInfoFormData.picture)
                                : customerInfoFormData.picture
                            }
                            height={100}
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t("Government ID Picture")}</label>
                        <FormImageResize
                          onCallbackData={(data) => handleCustomerInfoImageData("govPicture", data)}
                          disabled={isSaving}
                        />
                        {customerInfoFormData.govPicture && (
                          <FormImagePreview
                            imgSrc={
                              customerInfoFormData.govPicture instanceof File
                                ? URL.createObjectURL(customerInfoFormData.govPicture)
                                : customerInfoFormData.govPicture
                            }
                            height={100}
                          />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        name="region"
                        disabled={isSaving}
                        label={t("Region")}
                        value={customerInfoFormData.region}
                        placeholder={t("Region")}
                        onCallbackInput={handleCustomerInfoChange}
                      />
                      <FormInput
                        name="email"
                        disabled={isSaving}
                        label={t("Email")}
                        value={customerInfoFormData.email}
                        placeholder={t("Email")}
                        onCallbackInput={handleCustomerInfoChange}
                        type="email"
                      />
                    </div>
                    <FormTextArea
                      rows={4}
                      name="note"
                      label={t("Notes")}
                      disabled={isSaving}
                      value={customerInfoFormData.note}
                      onCallbackInput={handleCustomerInfoChange}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        name="loyaltyPoints"
                        disabled={isSaving}
                        label={t("Loyalty Points")}
                        value={customerInfoFormData.loyaltyPoints}
                        placeholder={t("Loyalty Points")}
                        onCallbackInput={(name, value) => handleCustomerInfoChange(name, parseInt(value) || 0)}
                        type="number"
                      />
                      <FormDatePicker
                        label={t("Last Purchase Date")}
                        date={customerInfoFormData.lastPurchaseDate}
                        onCallbackPicker={(date) => handleCustomerInfoChange("lastPurchaseDate", date)}
                        fromYear={2000}
                        toYear={2025}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        name="govId"
                        disabled={isSaving}
                        label={t("Government ID")}
                        value={customerInfoFormData.govId}
                        placeholder={t("Government ID")}
                        onCallbackInput={handleCustomerInfoChange}
                      />
                      <FormDatePicker
                        label={t("Government ID Expiry")}
                        date={customerInfoFormData.govExpire}
                        onCallbackPicker={(date) => handleCustomerInfoChange("govExpire", date)}
                        fromYear={2020}
                        toYear={2030}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormComboBox
                        name="status"
                        label={t("Status")}
                        item={statusOptions}
                        optID="time"
                        optLabel="less"
                        onCallbackSelect={(value) => handleCustomerInfoChange("status", value)}
                        defaultValue={customerInfoFormData.status}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSaving}>
                        {t("Cancel")}
                      </Button>
                      <Button type="submit" disabled={isSaving || !editingCustomer}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("Saving...")}
                          </>
                        ) : (
                          t("Save Customer Info")
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {(custError || empError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">{t("Error loading data")}</p>
                <p className="text-sm text-muted-foreground">{custError || empError}</p>
              </div>
              <Button variant="outline" onClick={handleRetry} disabled={custLoading || empLoading}>
                {t("Try Again")}
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
                <User className="h-5 w-5" />
                {t("Customer Directory")}
                {(custLoading || empLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredCustomers.length} {t("customers in your organization")}</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search customers...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={custLoading || empLoading}
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
              columns={4}
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




// "use client"
// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
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
// import { ViewToggle } from "@/components/ui/view-toggle"
// import { DataTable } from "@/components/ui/data-table"
// import { DataCards } from "@/components/ui/data-cards"
// import { Plus, Search, Users, Loader2, RefreshCw, Phone, Mail } from "lucide-react"
// import { useCustomerStore } from "@/stores/customer-store"
// import { useEmployeeStore } from "@/stores/employee-store"
// import { t } from "i18next"

// export default function CustomersPage() {
//   const {
//     items: customers,
//     isLoading: custLoading,
//     error: custError,
//     fetch: fetchCustomers,
//     create,
//     update,
//     delete: deleteCustomer,
//   } = useCustomerStore()

//   const {
//     items: employees,
//     isLoading: empLoading,
//     error: empError,
//     fetch: fetchEmployees,
//   } = useEmployeeStore()

//   const [isSaving, setIsSaving] = useState(false)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [view, setView] = useState("table")
//   const [editingCustomer, setEditingCustomer] = useState(null)

//   useEffect(() => {
//     fetchCustomers()
//     fetchEmployees()
//   }, [fetchCustomers, fetchEmployees])

//   const activeCustomers = customers.filter((cust) => cust.status === "active")

//   const filteredCustomers = activeCustomers.filter(
//     (customer) =>
//       customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   // Table columns configuration
//   const tableColumns = [
//     {
//       key: "name",
//       label: "Customer",
//       render: (_value, row) => (
//         <div>
//           <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
//           <div className="text-sm text-muted-foreground capitalize">{row.gender}</div>
//         </div>
//       ),
//     },
//     {
//       key: "contact",
//       label: "Contact",
//       render: (_value, row) => (
//         <div className="space-y-1">
//           {row.phone && (
//             <div className="flex items-center gap-1 text-sm">
//               <Phone className="h-3 w-3" />
//               {row.phone}
//             </div>
//           )}
//           {row.CustomerInfo?.email && (
//             <div className="flex items-center gap-1 text-sm">
//               <Mail className="h-3 w-3" />
//               {row.CustomerInfo.email}
//             </div>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "location",
//       label: "Location",
//       render: (_value, row) =>
//         `${row.Address?.City?.name || row.CustomerInfo?.region || "-"}` +
//         (row.Address?.State?.name ? `, ${row.Address.State.name}` : ""),
//     },
//     {
//       key: "Employee",
//       label: "Assigned To",
//       render: (_value, row) =>
//         row.Employee ? `${row.Employee.firstName} ${row.Employee.lastName}` : "-",
//     },
//     {
//       key: "_count.Sale",
//       label: "Sales",
//       type: "badge",
//       render: (_value, row) => row._count?.Sale || 0,
//     },
//     {
//       key: "status",
//       label: "Status",
//       type: "badge",
//     },
//     {
//       key: "createdAt",
//       label: "Joined",
//       type: "date",
//     },
//   ]

//   // Card fields configuration
//   const cardFields = [
//     {
//       key: "name",
//       primary: true,
//       render: (_value, row) => `${row.firstName} ${row.lastName}`,
//     },
//     {
//       key: "gender",
//       label: "Gender",
//       secondary: true,
//       render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "-",
//     },
//     {
//       key: "contact",
//       label: "Contact Info",
//       render: (_value, row) => (
//         <div className="space-y-1">
//           {row.phone && (
//             <div className="flex items-center gap-1 text-sm">
//               <Phone className="h-4 w-4" />
//               {row.phone}
//             </div>
//           )}
//           {row.CustomerInfo?.email && (
//             <div className="flex items-center gap-1 text-sm">
//               <Mail className="h-4 w-4" />
//               {row.CustomerInfo.email}
//             </div>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "location",
//       label: "Location",
//       render: (_value, row) =>
//         `${row.Address?.City?.name || row.CustomerInfo?.region || "-"}` +
//         (row.Address?.State?.name ? `, ${row.Address.State.name}` : ""),
//     },
//     {
//       key: "Employee",
//       label: "Assigned To",
//       render: (_value, row) =>
//         row.Employee ? `${row.Employee.firstName} ${row.Employee.lastName}` : "-",
//     },
//     {
//       key: "_count.Sale",
//       label: "Sales",
//       type: "badge",
//       render: (_value, row) => row._count?.Sale || 0,
//     },
//     {
//       key: "status",
//       label: "Status",
//       type: "badge",
//     },
//     {
//       key: "createdAt",
//       label: "Joined",
//       type: "date",
//     },
//   ]

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     const formData = new FormData(e.currentTarget)
//     const customerData = {
//       firstName: formData.get("firstName"),
//       lastName: formData.get("lastName"),
//       gender: formData.get("gender"),
//       phone: formData.get("phone"),
//       email: formData.get("email"),
//       region: formData.get("region"),
//       note: formData.get("note"),
//       employeeId: formData.get("employeeId") || null,
//     }

//     setIsSaving(true)
//     try {
//       const success = editingCustomer
//         ? await update(editingCustomer.customerId, customerData)
//         : await create(customerData)
//       setIsSaving(false)

//       if (success) {

//         setIsDialogOpen(false)
//         setEditingCustomer(null)
//           ; (e.target).reset()
//       } else {
//         throw new Error("Customer operation failed")
//       }
//     } catch (error) {
//       setIsSaving(false)

//     }
//   }

//   const handleEdit = (customer) => {
//     setEditingCustomer(customer)
//     setIsDialogOpen(true)
//   }

//   const handleDelete = async (customerId) => {
//     if (!confirm("Are you sure you want to delete this customer?")) return

//     const success = await deleteCustomer(customerId)

//   }

//   const handleRetry = () => {
//     fetchCustomers()
//     fetchEmployees()
//   }

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">{("Customers")}</h1>
//           <p className="text-muted-foreground">{t("Manage your customer relationships and contact information")}</p>
//         </div>

//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleRetry} disabled={custLoading || empLoading}>
//             <RefreshCw className={`mr-2 h-4 w-4 ${custLoading || empLoading ? "animate-spin" : ""}`} />
//             {t("Refresh")}
//           </Button>

//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open)
//               if (!open) setEditingCustomer(null)
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button disabled={employees.length === 0}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 {t("Add Customer")}
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[600px]">
//               <DialogHeader>
//                 <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
//                 <DialogDescription>
//                   {editingCustomer ? "Update customer details" : "Create a new customer record"}
//                 </DialogDescription>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="firstName">{t("First Name")} *</Label>
//                     <Input
//                       id="firstName"
//                       name="firstName"
//                       required
//                       defaultValue={editingCustomer?.firstName || ""}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="lastName">{t("Last Name")} *</Label>
//                     <Input
//                       id="lastName"
//                       name="lastName"
//                       required
//                       defaultValue={editingCustomer?.lastName || ""}
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="gender">Gender</Label>
//                     <Select
//                       name="gender"
//                       defaultValue={editingCustomer?.gender || "male"}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="male">Male</SelectItem>
//                         <SelectItem value="female">Female</SelectItem>
//                         <SelectItem value="others">Others</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="phone">{t("Phone")}</Label>
//                     <Input
//                       id="phone"
//                       name="phone"
//                       type="tel"
//                       defaultValue={editingCustomer?.phone || ""}
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="email">{t("Email")}</Label>
//                     <Input
//                       id="email"
//                       name="email"
//                       type="email"
//                       defaultValue={editingCustomer?.CustomerInfo?.email || ""}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="region">{t("Region")}</Label>
//                     <Input
//                       id="region"
//                       name="region"
//                       defaultValue={editingCustomer?.CustomerInfo?.region || ""}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="employeeId">Assigned Employee</Label>
//                   <Select
//                     name="employeeId"
//                   // defaultValue={editingCustomer?.employeeId || ""}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select employee (optional)" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="">{t("None")}</SelectItem>
//                       {employees?.map((employee) => (
//                         <SelectItem key={employee.employeeId} value={employee.employeeId}>
//                           {employee.firstName} {employee.lastName}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="note">{t("Notes")}</Label>
//                   <Textarea
//                     id="note"
//                     name="note"
//                     rows={3}
//                     defaultValue={editingCustomer?.note || ""}
//                   />
//                 </div>

//                 <div className="flex justify-end gap-2">
//                   <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                     {t("Cancel")}
//                   </Button>
//                   <Button type="submit" disabled={isSaving}>
//                     {isSaving ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         {editingCustomer ? "Updating..." : "Creating..."}
//                       </>
//                     ) : editingCustomer ? (
//                       "Update Customer"
//                     ) : (
//                       "Create Customer"
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </motion.div>

//       {/* Error Display */}
//       {(custError || empError) && (
//         <Card className="border-destructive">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-destructive font-medium">{t("Error loading data")}</p>
//                 <p className="text-sm text-muted-foreground">{custError || empError}</p>
//               </div>
//               <Button variant="outline" onClick={handleRetry}>
//                 Try Again
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle className="flex items-center gap-2">
//                 <Users className="h-5 w-5" />
//                 {t("Customer Directory")}
//                 {(custLoading || empLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
//               </CardTitle>
//               <CardDescription>{filteredCustomers.length} customers in your database</CardDescription>
//             </div>
//             <ViewToggle view={view} onViewChange={setView} />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search customers..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           {view === "card" ? (
//             <DataCards
//               data={filteredCustomers}
//               fields={cardFields}
//               loading={custLoading || empLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="customerId"
//               nameField="firstName"
//               columns={3}
//             />
//           ) : (
//             <DataTable
//               data={filteredCustomers}
//               columns={tableColumns}
//               loading={custLoading || empLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="customerId"
//               nameField="firstName"
//             />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


