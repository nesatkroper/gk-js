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
import {
  createCustomer,
  updateCustomer,
  createCustomerInfo,
  updateCustomerInfo,
  deleteCustomer,
  uploadCustomerImages,
} from "@/app/actions/customers"
import {
  FormInput,
  FormTextArea,
  FormImageResize,
  FormImagePreview,
  FormDatePicker,
  FormComboBox,
} from "@/components/form"
import { usePermissions } from "@/hooks/use-permissions"
import { toast } from "sonner"

export const dynamic = "force-dynamic"

export default function CustomersPage() {
  const { t } = useTranslation("common")
  const { canCreate, canUpdate, canDelete } = usePermissions()
  const { items: customers, isLoading: custLoading, error: custError, fetch: fetchCustomers } = useCustomerStore()
  const { items: employees, isLoading: empLoading, error: empError, fetch: fetchEmployees } = useEmployeeStore()

  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [customerFormError, setCustomerFormError] = useState(null)
  const [customerInfoFormError, setCustomerInfoFormError] = useState(null)
  const [customerImagesFormError, setCustomerImagesFormError] = useState(null)

  const {
    formData: customerFormData,
    resetForm: resetCustomerForm,
    setFormData: setCustomerFormData,
    handleChange: handleCustomerChange,
    handleImageData: handleCustomerImageData,
    getSubmissionData: getCustomerSubmissionData,
  } = useFormHandler({
    firstName: "",
    lastName: "",
    gender: "male",
    phone: "",
    picture: null,
    status: "active",
    employeeId: "",
  })

  const {
    formData: customerInfoFormData,
    resetForm: resetCustomerInfoForm,
    setFormData: setCustomerInfoFormData,
    handleChange: handleCustomerInfoChange,
    getSubmissionData: getCustomerInfoSubmissionData,
  } = useFormHandler({
    customerId: "",
    album: [],
    region: "",
    email: "",
    refPhone: "",
    note: "",
    loyaltyPoints: 0,
    lastPurchaseDate: null,
    govId: "",
    govExpire: null,
    contractPDF: "",
    status: "active",
    imageType: "address",
  })

  const {
    formData: customerImagesFormData,
    handleImageArray: handleCustomerImagesArray,
    removeImageFromArray: removeCustomerImageFromArray,
  } = useFormHandler({
    images: [], 
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchCustomers("all"), fetchEmployees()])
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }
    loadData()
  }, [fetchCustomers, fetchEmployees])

  const activeCustomers = customers.filter((cust) => cust.status === "active")

  const filteredCustomers = activeCustomers.filter(
    (customer) =>
      customer.firstName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      (customer.phone?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false) ||
      (customer.Customerinfo?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false),
  )

  const tableColumns = [
    {
      key: "name",
      label: t("Customer"),
      render: (_value, row) => (
        <div>
          <div className="font-medium">{`${row.firstName || ""} ${row.lastName || ""}`}</div>
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
      render: (_value, row) => (row.Employee ? `${row.Employee.firstName || ""} ${row.Employee.lastName || ""}` : "-"),
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
      render: (_value, row) => `${row.firstName || ""} ${row.lastName || ""}`,
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
      render: (_value, row) => (row.Employee ? `${row.Employee.firstName || ""} ${row.Employee.lastName || ""}` : "-"),
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

  const handleCustomerSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setCustomerFormError(null)

    try {
      const { data, files } = getCustomerSubmissionData()
      if (!data.firstName) throw new Error(t("First name is required"))
      if (!data.lastName) throw new Error(t("Last name is required"))

      const result = editingCustomer
        ? await updateCustomer(editingCustomer.customerId, data, files.picture)
        : await createCustomer(data, files.picture)

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

  const handleCustomerInfoSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setCustomerInfoFormError(null)

    try {
      const { data } = getCustomerInfoSubmissionData()
      if (!editingCustomer) throw new Error(t("Create customer first"))

      const result = editingCustomer.Customerinfo
        ? await updateCustomerInfo(editingCustomer.customerId, data)
        : await createCustomerInfo(data)

      if (!result.success) {
        throw new Error(result.error || t("Customer info operation failed"))
      }

      toast.success(t("Customer info saved successfully"))
      await fetchCustomers()
    } catch (err) {
      console.error("Customer info operation error:", err)
      setCustomerInfoFormError(err.message || t("An error occurred"))
      toast.error(err.message || t("An error occurred"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCustomerImagesSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setCustomerImagesFormError(null)

    try {
      if (!editingCustomer) throw new Error(t("Create customer first"))

      // Add null check for customerImagesFormData.images
      if (!customerImagesFormData.images || !Array.isArray(customerImagesFormData.images)) {
        throw new Error(t("No images to upload"))
      }

      const imageFiles = customerImagesFormData.images.map((img) => {
        if (!img || !img.file || !img.imageType) {
          throw new Error(t("Invalid image data"))
        }
        return {
          file: img.file,
          imageType: img.imageType,
        }
      })

      console.log(
        "Submitting images:",
        imageFiles.map((img) => ({ name: img.file.name, type: img.imageType })),
      )

      const result = await uploadCustomerImages(editingCustomer.customerId, imageFiles)

      if (!result.success) {
        throw new Error(result.error || t("Customer images upload failed"))
      }

      toast.success(t("Customer images uploaded successfully"))
      handleCustomerImagesArray("images", []) // Clear images after upload
      await fetchCustomers()
    } catch (err) {
      console.error("Customer images upload error:", err)
      setCustomerImagesFormError(err.message || t("An error occurred"))
      toast.error(err.message || t("An error occurred"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCustomerImageCrop = (formDataArray) => {
    console.log("Received formDataArray:", formDataArray)

    // Handle both single FormData and array of FormData
    const formDataList = Array.isArray(formDataArray) ? formDataArray : [formDataArray]

    const files = []
    formDataList.forEach((fd, index) => {
      console.log(`FormData ${index} entries:`, Array.from(fd.entries()))

      // Try different possible field names
      const file =
        fd.get(`picture_${index}`) || fd.get("picture") || fd.get(`customerImages_${index}`) || fd.get("customerImages")

      if (file && file instanceof File) {
        files.push(file)
      }
    })

    console.log(
      "Extracted files:",
      files.map((f) => f.name),
    )

    const imageType = customerInfoFormData.imageType || "address"
    if (files.length > 0) {
      const newImages = files.map((file) => ({ file, imageType }))
      console.log(
        "New images to add:",
        newImages.map((img) => ({ name: img.file.name, type: img.imageType })),
      )

      // Use the correct function name
      handleCustomerImagesArray("images", [...customerImagesFormData.images, ...newImages])
      console.log(
        "Updated customerImagesFormData:",
        customerImagesFormData.images.map((img) => ({ name: img.file.name, type: img.imageType })),
      )
    } else {
      console.warn("No valid files found in formDataArray")
    }
  }

  const handleRemoveCustomerImage = (index) => {
    console.log("Removing image at index:", index)
    removeCustomerImageFromArray("images", index)
    console.log(
      "After removal, customerImagesFormData:",
      customerImagesFormData.images.map((img) => ({ name: img.file.name, type: img.imageType })),
    )
  }

  const handleEdit = (customer) => {
    if (!canUpdate) return
    setCustomerFormData({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      gender: customer.gender || "male",
      phone: customer.phone || "",
      picture: customer.picture || null,
      status: customer.status || "active",
      employeeId: customer.employeeId || "",
    })
    setCustomerInfoFormData({
      customerId: customer.customerId || "",
      album: customer.Customerinfo?.album || [],
      region: customer.Customerinfo?.region || "",
      email: customer.Customerinfo?.email || "",
      refPhone: customer.Customerinfo?.refPhone || "",
      note: customer.Customerinfo?.note || "",
      loyaltyPoints: customer.Customerinfo?.loyaltyPoints || 0,
      lastPurchaseDate: customer.Customerinfo?.lastPurchaseDate
        ? new Date(customer.Customerinfo.lastPurchaseDate)
        : null,
      govId: customer.Customerinfo?.govId || "",
      govExpire: customer.Customerinfo?.govExpire ? new Date(customer.Customerinfo.govExpire) : null,
      contractPDF: customer.Customerinfo?.contractPDF || "",
      status: customer.Customerinfo?.status || "active",
      imageType: "address",
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
      handleCustomerImagesArray("images", [])
      setCustomerFormError(null)
      setCustomerInfoFormError(null)
      setCustomerImagesFormError(null)
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

  const imageTypeOptions = [
    { time: "address", less: t("Address") },
    { time: "backId", less: t("Back ID") },
    { time: "frontId", less: t("Front ID") },
    { time: "card", less: t("Card") },
    { time: "album", less: t("Album") },
    { time: "product", less: t("Product") },
    { time: "contract", less: t("Contract") },
  ]

  const employeeOptions = employees.map((emp) => ({
    time: emp.employeeId,
    less: `${emp.firstName || ""} ${emp.lastName || ""}`,
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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="customer">{t("Customer Details")}</TabsTrigger>
                  <TabsTrigger value="customerInfo" disabled={!editingCustomer}>
                    {t("Additional Info")}
                  </TabsTrigger>
                  <TabsTrigger value="customerImages" disabled={!editingCustomer}>
                    {t("Images")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="customer">
                  <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    {customerFormError && <p className="text-red-500 text-sm">{customerFormError}</p>}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("Profile Picture")}</label>
                      <FormImageResize
                        onCallbackData={(formData) => handleCustomerImageData("picture", formData.get("picture"))}
                        disabled={isSaving}
                        label={t("Profile Picture")}
                        fieldName="picture"
                      />
                      {customerFormData.picture && (
                        <FormImagePreview
                          imgSrc={
                            customerFormData.picture instanceof File
                              ? URL.createObjectURL(customerFormData.picture)
                              : customerFormData.picture
                          }
                          height={100}
                          onRemove={() => handleCustomerImageData("picture", null)}
                        />
                      )}
                    </div>
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDialogClose(false)}
                        disabled={isSaving}
                      >
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
                    {customerInfoFormError && <p className="text-red-500 text-sm">{customerInfoFormError}</p>}
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
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        name="refPhone"
                        disabled={isSaving}
                        label={t("Reference Phone")}
                        value={customerInfoFormData.refPhone}
                        placeholder={t("Reference Phone")}
                        onCallbackInput={handleCustomerInfoChange}
                        type="tel"
                      />
                      <FormInput
                        name="contractPDF"
                        disabled={isSaving}
                        label={t("Contract PDF")}
                        value={customerInfoFormData.contractPDF}
                        placeholder={t("Contract PDF URL")}
                        onCallbackInput={handleCustomerInfoChange}
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
                        onCallbackInput={(name, value) => handleCustomerInfoChange(name, Number.parseInt(value) || 0)}
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDialogClose(false)}
                        disabled={isSaving}
                      >
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
                <TabsContent value="customerImages">
                  <form onSubmit={handleCustomerImagesSubmit} className="space-y-4">
                    {customerImagesFormError && <p className="text-red-500 text-sm">{customerImagesFormError}</p>}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("Customer Images")}</label>
                      <div className="grid grid-cols-2 gap-4">
                        <FormComboBox
                          name="imageType"
                          label={t("Image Type")}
                          item={imageTypeOptions}
                          optID="time"
                          optLabel="less"
                          onCallbackSelect={(value) => handleCustomerInfoChange("imageType", value)}
                          defaultValue={customerInfoFormData.imageType || "address"}
                          disabled={isSaving}
                        />
                        <FormImageResize
                          onCallbackData={handleCustomerImageCrop}
                          label={t("Upload Images")}
                          multiple
                          maxImages={5}
                          fieldName="customerImages"
                          disabled={isSaving}
                        />
                      </div>
                      {customerImagesFormData.images.length > 0 && (
                        <FormImagePreview
                          imgSrc={customerImagesFormData.images.map((img) => URL.createObjectURL(img.file))}
                          label={t("Image Preview")}
                          multiple
                          maxImages={5}
                          onRemove={handleRemoveCustomerImage}
                        />
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDialogClose(false)}
                        disabled={isSaving}
                      >
                        {t("Cancel")}
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          isSaving ||
                          !editingCustomer ||
                          !customerImagesFormData.images ||
                          customerImagesFormData.images.length === 0
                        }
                        onClick={() => {
                          console.log("Upload button clicked")
                          console.log("isSaving:", isSaving)
                          console.log("editingCustomer:", !!editingCustomer)
                          console.log("images:", customerImagesFormData.images)
                          console.log("images length:", customerImagesFormData.images?.length || 0)
                          if (customerImagesFormData.images) {
                            console.log(
                              "images details:",
                              customerImagesFormData.images.map((img) => ({
                                name: img?.file?.name,
                                type: img?.imageType,
                              })),
                            )
                          }
                        }}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("Uploading...")}
                          </>
                        ) : (
                          t("Upload Images")
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
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-500 font-medium">{t("Error loading data")}</p>
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
              <CardDescription>
                {filteredCustomers.length} {t("customers in your organization")}
              </CardDescription>
            </div>
            <ViewToggle view={view} onChange={setView} />
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
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ViewToggle } from "@/components/ui/view-toggle"
// import { DataTable } from "@/components/ui/data-table"
// import { DataCards } from "@/components/ui/data-cards"
// import { Plus, Search, User, Loader2, RefreshCw, Phone, Mail } from "lucide-react"
// import { useTranslation } from "react-i18next"
// import { useFormHandler } from "@/hooks/use-form"
// import { useCustomerStore } from "@/stores/customer-store"
// import { useEmployeeStore } from "@/stores/employee-store"
// import { createCustomer, updateCustomer, createCustomerInfo, updateCustomerInfo, deleteCustomer, uploadCustomerImages } from "@/app/actions/customers"
// import { FormInput, FormTextArea, FormImageResize, FormImagePreview, FormDatePicker, FormComboBox } from "@/components/form"
// import { usePermissions } from "@/hooks/use-permissions"
// import { toast } from "sonner"

// export const dynamic = 'force-dynamic'

// export default function CustomersPage() {
//   const { t } = useTranslation("common")
//   const { canCreate, canUpdate, canDelete } = usePermissions()
//   const {
//     items: customers,
//     isLoading: custLoading,
//     error: custError,
//     fetch: fetchCustomers,
//   } = useCustomerStore()
//   const {
//     items: employees,
//     isLoading: empLoading,
//     error: empError,
//     fetch: fetchEmployees,
//   } = useEmployeeStore()

//   const [isSaving, setIsSaving] = useState(false)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [view, setView] = useState("table")
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [editingCustomer, setEditingCustomer] = useState(null)
//   const [customerFormError, setCustomerFormError] = useState(null)
//   const [customerInfoFormError, setCustomerInfoFormError] = useState(null)
//   const [customerImagesFormError, setCustomerImagesFormError] = useState(null)

//   const {
//     formData: customerFormData,
//     resetForm: resetCustomerForm,
//     setFormData: setCustomerFormData,
//     handleChange: handleCustomerChange,
//     handleImageData: handleCustomerImageData,
//     getSubmissionData: getCustomerSubmissionData
//   } = useFormHandler({
//     firstName: "",
//     lastName: "",
//     gender: "male",
//     phone: "",
//     picture: null,
//     status: "active",
//     employeeId: "",
//   })

//   const {
//     formData: customerInfoFormData,
//     resetForm: resetCustomerInfoForm,
//     setFormData: setCustomerInfoFormData,
//     handleChange: handleCustomerInfoChange,
//     getSubmissionData: getCustomerInfoSubmissionData
//   } = useFormHandler({
//     customerId: "",
//     album: [],
//     region: "",
//     email: "",
//     refPhone: "",
//     note: "",
//     loyaltyPoints: 0,
//     lastPurchaseDate: null,
//     govId: "",
//     govExpire: null,
//     contractPDF: "",
//     status: "active",
//   })

//   const {
//     formData: customerImagesFormData,
//     handleImageArray: handleCustomerImagesArray,
//     removeImageFromArray: removeCustomerImageFromArray,
//   } = useFormHandler({
//     images: [],
//   })

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         await Promise.all([
//           fetchCustomers('all'),
//           fetchEmployees(),
//         ])
//       } catch (error) {
//         console.error("Failed to load data:", error)
//       }
//     }
//     loadData()
//   }, [fetchCustomers, fetchEmployees])

//   const activeCustomers = customers.filter((cust) => cust.status === "active")

//   const filteredCustomers = activeCustomers.filter(
//     (customer) =>
//       customer.firstName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
//       customer.lastName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
//       (customer.phone?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false) ||
//       (customer.Customerinfo?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false)
//   )

//   const tableColumns = [
//     {
//       key: "name",
//       label: t("Customer"),
//       render: (_value, row) => (
//         <div>
//           <div className="font-medium">{`${row.firstName || ''} ${row.lastName || ''}`}</div>
//         </div>
//       ),
//     },
//     {
//       key: "contact",
//       label: t("Contact"),
//       render: (_value, row) => (
//         <div className="space-y-1">
//           {row.phone && (
//             <div className="flex items-center gap-1 text-sm">
//               <Phone className="h-3 w-3" />
//               {row.phone}
//             </div>
//           )}
//           {row.Customerinfo?.email && (
//             <div className="flex items-center gap-1 text-sm">
//               <Mail className="h-3 w-3" />
//               {row.Customerinfo.email}
//             </div>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "Employee.name",
//       label: t("Assigned Employee"),
//       render: (_value, row) => row.Employee ? `${row.Employee.firstName || ''} ${row.Employee.lastName || ''}` : "-",
//     },
//     {
//       key: "Customerinfo.loyaltyPoints",
//       label: t("Loyalty Points"),
//       render: (_value, row) => row.Customerinfo?.loyaltyPoints || 0,
//     },
//     {
//       key: "Customerinfo.lastPurchaseDate",
//       label: t("Last Purchase"),
//       type: "date",
//     },
//     {
//       key: "status",
//       label: t("Status"),
//       type: "badge",
//     },
//     {
//       key: "createdAt",
//       label: t("Created"),
//       type: "date",
//     },
//     {
//       key: "updatedAt",
//       label: t("Updated"),
//       type: "date",
//     },
//   ]

//   const cardFields = [
//     {
//       key: "name",
//       primary: true,
//       render: (_value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
//     },
//     {
//       key: "contact",
//       label: t("Contact Info"),
//       render: (_value, row) => (
//         <div className="space-y-1">
//           {row.phone && (
//             <div className="flex items-center gap-1 text-sm">
//               <Phone className="h-4 w-4" />
//               {row.phone}
//             </div>
//           )}
//           {row.Customerinfo?.email && (
//             <div className="flex items-center gap-1 text-sm">
//               <Mail className="h-4 w-4" />
//               {row.Customerinfo.email}
//             </div>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "Employee.name",
//       label: t("Assigned Employee"),
//       render: (_value, row) => row.Employee ? `${row.Employee.firstName || ''} ${row.Employee.lastName || ''}` : "-",
//     },
//     {
//       key: "Customerinfo.loyaltyPoints",
//       label: t("Loyalty Points"),
//       render: (_value, row) => row.Customerinfo?.loyaltyPoints || 0,
//     },
//     {
//       key: "Customerinfo.lastPurchaseDate",
//       label: t("Last Purchase"),
//       type: "date",
//     },
//     {
//       key: "status",
//       label: t("Status"),
//       type: "badge",
//     },
//     {
//       key: "createdAt",
//       label: t("Created"),
//       type: "date",
//     },
//     {
//       key: "updatedAt",
//       label: t("Updated"),
//       type: "date",
//     },
//   ]

//   const handleCustomerSubmit = async (e) => {
//     e.preventDefault()
//     setIsSaving(true)
//     setCustomerFormError(null)

//     try {
//       const { data, files } = getCustomerSubmissionData()
//       if (!data.firstName) throw new Error(t("First name is required"))
//       if (!data.lastName) throw new Error(t("Last name is required"))

//       const result = editingCustomer
//         ? await updateCustomer(editingCustomer.customerId, data, files.picture)
//         : await createCustomer(data, files.picture)

//       if (!result.success) {
//         throw new Error(result.error || t("Customer operation failed"))
//       }

//       toast.success(editingCustomer ? t("Customer updated successfully") : t("Customer created successfully"))

//       if (!editingCustomer && result.customer.customerId) {
//         setEditingCustomer(result.customer)
//         setCustomerInfoFormData({
//           ...customerInfoFormData,
//           customerId: result.customer.customerId,
//         })
//       }

//       await fetchCustomers()
//     } catch (err) {
//       console.error("Customer operation error:", err)
//       setCustomerFormError(err.message || t("An error occurred"))
//       toast.error(err.message || t("An error occurred"))
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const handleCustomerInfoSubmit = async (e) => {
//     e.preventDefault()
//     setIsSaving(true)
//     setCustomerInfoFormError(null)

//     try {
//       const { data } = getCustomerInfoSubmissionData()
//       if (!editingCustomer) throw new Error(t("Create customer first"))

//       const result = editingCustomer.Customerinfo
//         ? await updateCustomerInfo(editingCustomer.customerId, data)
//         : await createCustomerInfo(data)

//       if (!result.success) {
//         throw new Error(result.error || t("Customer info operation failed"))
//       }

//       toast.success(t("Customer info saved successfully"))
//       await fetchCustomers()
//     } catch (err) {
//       console.error("Customer info operation error:", err)
//       setCustomerInfoFormError(err.message || t("An error occurred"))
//       toast.error(err.message || t("An error occurred"))
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const handleCustomerImagesSubmit = async (e) => {
//     e.preventDefault()
//     setIsSaving(true)
//     setCustomerImagesFormError(null)

//     try {
//       if (!editingCustomer) throw new Error(t("Create customer first"))

//       const imageFiles = customerImagesFormData.images.map((img) => ({
//         file: img.file,
//         imageType: img.imageType,
//       }))

//       const result = await uploadCustomerImages(editingCustomer.customerId, imageFiles)

//       if (!result.success) {
//         throw new Error(result.error || t("Customer images upload failed"))
//       }

//       toast.success(t("Customer images uploaded successfully"))
//       handleCustomerImagesArray("images", []) // Clear images after upload
//       await fetchCustomers()
//     } catch (err) {
//       console.error("Customer images upload error:", err)
//       setCustomerImagesFormError(err.message || t("An error occurred"))
//       toast.error(err.message || t("An error occurred"))
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const handleCustomerImageCrop = (formDataArray) => {
//     // Handle array of FormData objects, as expected from FormImageResize with multiple prop
//     const files = formDataArray.map((fd) => {
//       // Check for both "picture_0" and "picture" keys
//       return fd.get("picture_0") || fd.get("picture");
//     }).filter(Boolean); // Filter out null/undefined values

//     const imageType = formDataArray[0]?.get("imageType") || customerInfoFormData.imageType || "address";
//     if (files.length > 0 && imageType) {
//       const newImages = files.map(file => ({ file, imageType }));
//       handleCustomerImagesArray("images", [...customerImagesFormData.images, ...newImages]);
//     }
//   };



//   const handleRemoveCustomerImage = (index) => {
//     removeCustomerImageFromArray("images", index)
//   }

//   const handleEdit = (customer) => {
//     if (!canUpdate) return
//     setCustomerFormData({
//       firstName: customer.firstName || "",
//       lastName: customer.lastName || "",
//       gender: customer.gender || "male",
//       phone: customer.phone || "",
//       picture: customer.picture || null,
//       status: customer.status || "active",
//       employeeId: customer.employeeId || "",
//     })
//     setCustomerInfoFormData({
//       customerId: customer.customerId || "",
//       album: customer.Customerinfo?.album || [],
//       region: customer.Customerinfo?.region || "",
//       email: customer.Customerinfo?.email || "",
//       refPhone: customer.Customerinfo?.refPhone || "",
//       note: customer.Customerinfo?.note || "",
//       loyaltyPoints: customer.Customerinfo?.loyaltyPoints || 0,
//       lastPurchaseDate: customer.Customerinfo?.lastPurchaseDate ? new Date(customer.Customerinfo.lastPurchaseDate) : null,
//       govId: customer.Customerinfo?.govId || "",
//       govExpire: customer.Customerinfo?.govExpire ? new Date(customer.Customerinfo.govExpire) : null,
//       contractPDF: customer.Customerinfo?.contractPDF || "",
//       status: customer.Customerinfo?.status || "active",
//     })
//     setEditingCustomer(customer)
//     setIsDialogOpen(true)
//   }

//   const handleDelete = async (customerId) => {
//     if (!canDelete) return
//     if (!confirm(t("Are you sure you want to delete this customer?"))) return

//     try {
//       const result = await deleteCustomer(customerId)
//       if (result.success) {
//         toast.success(t("Customer deleted successfully"))
//         await fetchCustomers()
//       } else {
//         throw new Error(result.error || t("Failed to delete customer"))
//       }
//     } catch (error) {
//       console.error("Customer deletion error:", error)
//       toast.error(error.message || t("Failed to delete customer"))
//     }
//   }

//   const handleRetry = () => {
//     fetchCustomers()
//     fetchEmployees()
//   }

//   const handleDialogClose = (open) => {
//     setIsDialogOpen(open)
//     if (!open) {
//       setEditingCustomer(null)
//       resetCustomerForm()
//       resetCustomerInfoForm()
//       handleCustomerImagesArray("images", [])
//       setCustomerFormError(null)
//       setCustomerInfoFormError(null)
//       setCustomerImagesFormError(null)
//     }
//   }

//   const genderOptions = [
//     { time: "male", less: t("Male") },
//     { time: "female", less: t("Female") },
//   ]

//   const statusOptions = [
//     { time: "active", less: t("Active") },
//     { time: "inactive", less: t("Inactive") },
//   ]

//   const imageTypeOptions = [
//     { time: "address", less: t("Address") },
//     { time: "backId", less: t("Back ID") },
//     { time: "frontId", less: t("Front ID") },
//     { time: "card", less: t("Card") },
//     { time: "album", less: t("Album") },
//     { time: "product", less: t("Product") },
//     { time: "contract", less: t("Contract") },
//   ]

//   const employeeOptions = employees.map((emp) => ({
//     time: emp.employeeId,
//     less: `${emp.firstName || ''} ${emp.lastName || ''}`,
//   }))

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">{t("Customers")}</h1>
//           <p className="text-muted-foreground">{t("Manage your customer information")}</p>
//         </div>
//         <div className="flex gap-2">
//           {canCreate && (
//             <Button variant="outline" onClick={handleRetry} disabled={custLoading || empLoading}>
//               <RefreshCw className={`mr-2 h-4 w-4 ${custLoading || empLoading ? "animate-spin" : ""}`} />
//               {t("Refresh")}
//             </Button>
//           )}
//           <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
//             <DialogTrigger asChild>
//               <Button disabled={custLoading || empLoading || !canCreate || employees.length === 0}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 {t("Add Customer")}
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>{editingCustomer ? t("Edit Customer") : t("Add New Customer")}</DialogTitle>
//                 <DialogDescription>
//                   {editingCustomer ? t("Update customer details") : t("Create a new customer record")}
//                 </DialogDescription>
//               </DialogHeader>
//               <Tabs defaultValue="customer" className="w-full">
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="customer">{t("Customer Details")}</TabsTrigger>
//                   <TabsTrigger value="customerInfo" disabled={!editingCustomer}>{t("Additional Info")}</TabsTrigger>
//                   <TabsTrigger value="customerImages" disabled={!editingCustomer}>{t("Images")}</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="customer">
//                   <form onSubmit={handleCustomerSubmit} className="space-y-4">
//                     {customerFormError && (
//                       <p className="text-red-500 text-sm">{customerFormError}</p>
//                     )}
//                     <div className="space-y-2">
//                       <FormImageResize
//                         onCallbackData={(formData) => handleCustomerImageData("picture", formData.get("picture"))}
//                         disabled={isSaving}
//                         label={t("Profile Picture")}
//                         fieldName="picture"
//                       />
//                       {customerFormData.picture && (
//                         <FormImagePreview
//                           imgSrc={
//                             customerFormData.picture instanceof File
//                               ? URL.createObjectURL(customerFormData.picture)
//                               : customerFormData.picture
//                           }
//                           height={100}
//                           onRemove={() => handleCustomerImageData("picture", null)}
//                         />
//                       )}
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <FormInput
//                         name="firstName"
//                         disabled={isSaving}
//                         label={t("First Name")}
//                         value={customerFormData.firstName}
//                         placeholder={t("First Name")}
//                         onCallbackInput={handleCustomerChange}
//                         required
//                         error={customerFormError && !customerFormData.firstName ? t("First name is required") : null}
//                       />
//                       <FormInput
//                         name="lastName"
//                         disabled={isSaving}
//                         label={t("Last Name")}
//                         value={customerFormData.lastName}
//                         placeholder={t("Last Name")}
//                         onCallbackInput={handleCustomerChange}
//                         required
//                         error={customerFormError && !customerFormData.lastName ? t("Last name is required") : null}
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <FormInput
//                         name="phone"
//                         disabled={isSaving}
//                         label={t("Phone")}
//                         value={customerFormData.phone}
//                         placeholder={t("Phone")}
//                         onCallbackInput={handleCustomerChange}
//                         type="tel"
//                       />
//                       <FormComboBox
//                         name="employeeId"
//                         label={t("Assigned Employee")}
//                         item={employeeOptions}
//                         optID="time"
//                         optLabel="less"
//                         onCallbackSelect={(value) => handleCustomerChange("employeeId", value)}
//                         defaultValue={customerFormData.employeeId}
//                         disabled={isSaving || empLoading}
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <FormComboBox
//                         name="gender"
//                         label={t("Gender")}
//                         item={genderOptions}
//                         optID="time"
//                         optLabel="less"
//                         onCallbackSelect={(value) => handleCustomerChange("gender", value)}
//                         defaultValue={customerFormData.gender}
//                         disabled={isSaving}
//                       />
//                       <FormComboBox
//                         name="status"
//                         label={t("Status")}
//                         item={statusOptions}
//                         optID="time"
//                         optLabel="less"
//                         onCallbackSelect={(value) => handleCustomerChange("status", value)}
//                         defaultValue={customerFormData.status}
//                         disabled={isSaving}
//                       />
//                     </div>
//                     <div className="flex justify-end gap-2">
//                       <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSaving}>
//                         {t("Cancel")}
//                       </Button>
//                       <Button type="submit" disabled={isSaving}>
//                         {isSaving ? (
//                           <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             {editingCustomer ? t("Updating...") : t("Creating...")}
//                           </>
//                         ) : editingCustomer ? (
//                           t("Update Customer")
//                         ) : (
//                           t("Create Customer")
//                         )}
//                       </Button>
//                     </div>
//                   </form>
//                 </TabsContent>
//                 <TabsContent value="customerInfo">
//                   <form onSubmit={handleCustomerInfoSubmit} className="space-y-4">
//                     {customerInfoFormError && (
//                       <p className="text-red-500 text-sm">{customerInfoFormError}</p>
//                     )}
//                     <div className="grid grid-cols-2 gap-4">
//                       <FormInput
//                         name="region"
//                         disabled={isSaving}
//                         label={t("Region")}
//                         value={customerInfoFormData.region}
//                         placeholder={t("Region")}
//                         onCallbackInput={handleCustomerInfoChange}
//                       />
//                       <FormInput
//                         name="email"
//                         disabled={isSaving}
//                         label={t("Email")}
//                         value={customerInfoFormData.email}
//                         placeholder={t("Email")}
//                         onCallbackInput={handleCustomerInfoChange}
//                         type="email"
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <FormInput
//                         name="refPhone"
//                         disabled={isSaving}
//                         label={t("Reference Phone")}
//                         value={customerInfoFormData.refPhone}
//                         placeholder={t("Reference Phone")}
//                         onCallbackInput={handleCustomerInfoChange}
//                         type="tel"
//                       />
//                       <FormInput
//                         name="contractPDF"
//                         disabled={isSaving}
//                         label={t("Contract PDF")}
//                         value={customerInfoFormData.contractPDF}
//                         placeholder={t("Contract PDF URL")}
//                         onCallbackInput={handleCustomerInfoChange}
//                       />
//                     </div>
//                     <FormTextArea
//                       rows={4}
//                       name="note"
//                       label={t("Notes")}
//                       disabled={isSaving}
//                       value={customerInfoFormData.note}
//                       onCallbackInput={handleCustomerInfoChange}
//                     />
//                     <div className="grid grid-cols-2 gap-4">
//                       <FormInput
//                         name="loyaltyPoints"
//                         disabled={isSaving}
//                         label={t("Loyalty Points")}
//                         value={customerInfoFormData.loyaltyPoints}
//                         placeholder={t("Loyalty Points")}
//                         onCallbackInput={(name, value) => handleCustomerInfoChange(name, parseInt(value) || 0)}
//                         type="number"
//                       />
//                       <FormDatePicker
//                         label={t("Last Purchase Date")}
//                         date={customerInfoFormData.lastPurchaseDate}
//                         onCallbackPicker={(date) => handleCustomerInfoChange("lastPurchaseDate", date)}
//                         fromYear={2000}
//                         toYear={2025}
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <FormInput
//                         name="govId"
//                         disabled={isSaving}
//                         label={t("Government ID")}
//                         value={customerInfoFormData.govId}
//                         placeholder={t("Government ID")}
//                         onCallbackInput={handleCustomerInfoChange}
//                       />
//                       <FormDatePicker
//                         label={t("Government ID Expiry")}
//                         date={customerInfoFormData.govExpire}
//                         onCallbackPicker={(date) => handleCustomerInfoChange("govExpire", date)}
//                         fromYear={2020}
//                         toYear={2030}
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <FormComboBox
//                         name="status"
//                         label={t("Status")}
//                         item={statusOptions}
//                         optID="time"
//                         optLabel="less"
//                         onCallbackSelect={(value) => handleCustomerInfoChange("status", value)}
//                         defaultValue={customerInfoFormData.status}
//                         disabled={isSaving}
//                       />
//                     </div>
//                     <div className="flex justify-end gap-2">
//                       <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSaving}>
//                         {t("Cancel")}
//                       </Button>
//                       <Button type="submit" disabled={isSaving || !editingCustomer}>
//                         {isSaving ? (
//                           <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             {t("Saving...")}
//                           </>
//                         ) : (
//                           t("Save Customer Info")
//                         )}
//                       </Button>
//                     </div>
//                   </form>
//                 </TabsContent>
//                 {/* <TabsContent value="customerImages">
//                   <form onSubmit={handleCustomerImagesSubmit} className="space-y-4">
//                     {customerImagesFormError && (
//                       <p className="text-red-500 text-sm">{customerImagesFormError}</p>
//                     )}
//                     <div className="space-y-2">
//                       <div className="grid grid-cols-2 gap-4">
//                         <FormComboBox
//                           name="imageType"
//                           label={t("Image Type")}
//                           item={imageTypeOptions}
//                           optID="time"
//                           optLabel="less"
//                           onCallbackSelect={(value) => handleCustomerInfoChange("imageType", value)}
//                           defaultValue={customerInfoFormData.imageType || "address"}
//                           disabled={isSaving}
//                         />
//                         <FormImageResize
//                           onCallbackData={handleCustomerImageCrop}
//                           label={t("Upload Images")}
//                           multiple
//                           maxImages={5}
//                           fieldName="customerImages"
//                           disabled={isSaving}
//                         />
//                       </div>
//                       {customerImagesFormData.images.length > 0 && (
//                         <FormImagePreview
//                           imgSrc={customerImagesFormData.images.map((img) => ({
//                             src: URL.createObjectURL(img.file),
//                             label: `${t(img.imageType.charAt(0).toUpperCase() + img.imageType.slice(1))} Image`,
//                           }))}
//                           multiple
//                           maxImages={5}
//                           onRemove={handleRemoveCustomerImage}
//                         />
//                       )}
//                     </div>
//                     <div className="flex justify-end gap-2">
//                       <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSaving}>
//                         {t("Cancel")}
//                       </Button>
//                       <Button type="submit" disabled={isSaving || !editingCustomer || customerImagesFormData.images.length === 0}>
//                         {isSaving ? (
//                           <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             {t("Uploading...")}
//                           </>
//                         ) : (
//                           t("Upload Images")
//                         )}
//                       </Button>
//                     </div>
//                   </form>
//                 </TabsContent> */}
//                 <TabsContent value="customerImages">
//                   <form onSubmit={handleCustomerImagesSubmit} className="space-y-4">
//                     {customerImagesFormError && (
//                       <p className="text-red-500 text-sm">{customerImagesFormError}</p>
//                     )}
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">{t("Customer Images")}</label>
//                       <div className="grid grid-cols-2 gap-4">
//                         <FormComboBox
//                           name="imageType"
//                           label={t("Image Type")}
//                           item={imageTypeOptions}
//                           optID="time"
//                           optLabel="less"
//                           onCallbackSelect={(value) => handleCustomerInfoChange("imageType", value)}
//                           defaultValue={customerInfoFormData.imageType || "address"}
//                           disabled={isSaving}
//                         />
//                         <FormImageResize
//                           onCallbackData={handleCustomerImageCrop}
//                           label={t("Upload Images")}
//                           multiple
//                           maxImages={5}
//                           fieldName="customerImages"
//                           disabled={isSaving}
//                           imageType={customerInfoFormData.imageType || "address"} // Pass imageType to FormImageResize
//                         />
//                       </div>
//                       {customerImagesFormData.images.length > 0 && (
//                         <FormImagePreview
//                           imgSrc={customerImagesFormData.images.map((img) => ({
//                             src: URL.createObjectURL(img.file),
//                             label: `${t(img.imageType.charAt(0).toUpperCase() + img.imageType.slice(1))} Image`,
//                           }))}
//                           multiple
//                           maxImages={5}
//                           onRemove={handleRemoveCustomerImage}
//                         />
//                       )}
//                     </div>
//                     <div className="flex justify-end gap-2">
//                       <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSaving}>
//                         {t("Cancel")}
//                       </Button>
//                       <Button type="submit" disabled={isSaving || !editingCustomer || customerImagesFormData.images.length === 0}>
//                         {isSaving ? (
//                           <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             {t("Uploading...")}
//                           </>
//                         ) : (
//                           t("Upload Images")
//                         )}
//                       </Button>
//                     </div>
//                   </form>
//                 </TabsContent>
//               </Tabs>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </motion.div>

//       {(custError || empError) && (
//         <Card className="border-destructive">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-destructive font-medium">{t("Error loading data")}</p>
//                 <p className="text-sm text-muted-foreground">{custError || empError}</p>
//               </div>
//               <Button variant="outline" onClick={handleRetry} disabled={custLoading || empLoading}>
//                 {t("Try Again")}
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
//                 <User className="h-5 w-5" />
//                 {t("Customer Directory")}
//                 {(custLoading || empLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
//               </CardTitle>
//               <CardDescription>{filteredCustomers.length} {t("customers in your organization")}</CardDescription>
//             </div>
//             <ViewToggle view={view} onViewChange={setView} />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder={t("Search customers...")}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//                 disabled={custLoading || empLoading}
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
//               columns={4}
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


