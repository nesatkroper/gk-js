
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
import { Plus, Search, UserCheck, Loader2, RefreshCw, Phone, Mail } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useFormHandler } from "@/hooks/use-form"
import { useEmployeeStore } from "@/stores/employee-store"
import { useDepartmentStore } from "@/stores/department-store"
import { usePositionStore } from "@/stores/position-store"
import { useBranchStore } from "@/stores/branch-store"
import {
  createEmployee,
  updateEmployee,
  createEmployeeInfo,
  updateEmployeeInfo,
  deleteEmployee,
  uploadEmployeeImages,
} from "@/app/actions/employees"
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
import { formatCurrency } from "@/lib/utils"

export default function EmployeesPage() {
  const { t } = useTranslation("common")
  const { canCreate, canUpdate, canDelete } = usePermissions()
  const { items: employees, isLoading: empLoading, error: empError, fetch: fetchEmployees } = useEmployeeStore()
  const { items: departments, isLoading: deptLoading, error: deptError, fetch: fetchDepartments } = useDepartmentStore()
  const { items: positions, isLoading: posLoading, error: posError, fetch: fetchPositions } = usePositionStore()
  const { items: branches, isLoading: branchLoading, error: branchError, fetch: fetchBranches } = useBranchStore()

  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [employeeFormError, setEmployeeFormError] = useState(null)
  const [employeeInfoFormError, setEmployeeInfoFormError] = useState(null)
  const [employeeImagesFormError, setEmployeeImagesFormError] = useState(null)

  const {
    formData: employeeFormData,
    resetForm: resetEmployeeForm,
    setFormData: setEmployeeFormData,
    handleChange: handleEmployeeChange,
    handleImageData: handleEmployeeImageData,
    getSubmissionData: getEmployeeSubmissionData,
  } = useFormHandler({
    employeeCode: "",
    firstName: "",
    lastName: "",
    gender: "male",
    phone: "",
    email: "",
    departmentId: "",
    positionId: "",
    branchId: "",
    salary: 0,
    dob: null,
    hiredDate: null,
    picture: null,
    status: "active",
  })

  const {
    formData: employeeInfoFormData,
    resetForm: resetEmployeeInfoForm,
    setFormData: setEmployeeInfoFormData,
    handleChange: handleEmployeeInfoChange,
    handleImageArray: handleEmployeeInfoImageArray,
    removeImageFromArray: removeEmployeeInfoImageFromArray,
    getSubmissionData: getEmployeeInfoSubmissionData,
  } = useFormHandler({
    managerId: "",
    region: "",
    nationality: "",
    note: "",
    maritalStatus: "single",
    emergencyContact: "",
    bloodType: "",
    bankAccount: "",
    govId: "",
    govExpire: null,
    contractType: "permanent",
    terminationDate: null,
    album: [],
    status: "active",
  })

  const {
    formData: employeeImagesFormData,
    handleImageArray: handleEmployeeImagesArray,
    removeImageFromArray: removeEmployeeImageFromArray,
  } = useFormHandler({
    images: [], 
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchEmployees("all"), fetchDepartments(), fetchPositions(), fetchBranches()])
      } catch (err) {
        console.error("Data load error:", err)
      }
    }
    loadData()
  }, [fetchEmployees, fetchDepartments, fetchPositions, fetchBranches])

  const activeEmployees = employees.filter((emp) => emp.status === "active")

  const filteredEmployees = activeEmployees.filter(
    (employee) =>
      employee.firstName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      employee.lastName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      (employee.employeeCode?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false) ||
      (employee.phone?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false),
  )

  const filteredPositions = positions.filter((position) =>
    selectedDepartment ? position.departmentId === selectedDepartment : true,
  )

  const tableColumns = [
    {
      key: "name",
      label: t("Employee"),
      render: (_value, row) => (
        <div>
          <div className="font-medium">{`${row.firstName || ""} ${row.lastName || ""}`}</div>
          {row.employeeCode && <div className="text-sm text-muted-foreground">{row.employeeCode}</div>}
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
          {row.email && (
            <div className="truncate flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              {row.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "Department.departmentName",
      label: t("Department"),
      render: (_value, row) => row.Department?.departmentName || "-",
    },
    {
      key: "Position.positionName",
      label: t("Position"),
      render: (_value, row) => row.Position?.positionName || "-",
    },
    {
      key: "Branch.branchName",
      label: t("Branch"),
      render: (_value, row) => row.Branch?.branchName || "-",
    },
    {
      key: "salary",
      label: t("Salary"),
      render: (value) => formatCurrency(value),
    },
    {
      key: "performance",
      label: t("Performance"),
      render: (_value, row) => (
        <div className="space-y-1">
          <div className="text-sm">
            {t("Sales")}: {row.Sale?.length || 0}
          </div>
          <div className="text-sm text-muted-foreground">
            {t("Attendance")}: {row.Attendance?.length || 0}
          </div>
        </div>
      ),
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
      key: "employeeCode",
      label: t("Employee Code"),
      secondary: true,
      render: (value) => value || "-",
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
      key: "Department.departmentName",
      label: t("Department"),
      render: (_value, row) => row.Department?.departmentName || "-",
    },
    {
      key: "Position.positionName",
      label: t("Position"),
      render: (_value, row) => row.Position?.positionName || "-",
    },
    {
      key: "Branch.branchName",
      label: t("Branch"),
      render: (_value, row) => row.Branch?.branchName || "-",
    },
    {
      key: "salary",
      label: t("Salary"),
      render: (value) => formatCurrency(value),
    },
    {
      key: "performance",
      label: t("Performance"),
      render: (_value, row) => (
        <div className="space-y-1">
          <div className="text-sm">
            {t("Sales")}: {row.Sale?.length || 0}
          </div>
          <div className="text-sm text-muted-foreground">
            {t("Attendance")}: {row.Attendance?.length || 0}
          </div>
        </div>
      ),
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

  async function handleEmployeeSubmit(e) {
    e.preventDefault()
    setIsSaving(true)
    setEmployeeFormError(null)

    try {
      const { data, files } = getEmployeeSubmissionData()
      if (!data.firstName) throw new Error(t("First name is required"))
      if (!data.lastName) throw new Error(t("Last name is required"))
      if (!data.departmentId) throw new Error(t("Department is required"))
      if (!data.positionId) throw new Error(t("Position is required"))
      if (!data.dob) throw new Error(t("Date of birth is required"))
      if (!data.hiredDate) throw new Error(t("Hired date is required"))
      if (!data.salary || data.salary < 0) throw new Error(t("Salary must be non-negative"))

      const result = editingEmployee
        ? await updateEmployee(editingEmployee.employeeId, data, files.picture)
        : await createEmployee(data, files.picture)

      if (!result.success) {
        throw new Error(result.error || t("Employee operation failed"))
      }

      toast.success(editingEmployee ? t("Employee updated successfully") : t("Employee created successfully"))

      if (!editingEmployee && result.employee.employeeId) {
        setEditingEmployee(result.employee)
        setEmployeeInfoFormData({
          ...employeeInfoFormData,
          employeeId: result.employee.employeeId,
        })
      }

      await fetchEmployees()
    } catch (err) {
      console.error("Employee operation error:", err)
      setEmployeeFormError(err.message || t("An error occurred"))
      toast.error(err.message || t("An error occurred"))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleEmployeeInfoSubmit(e) {
    e.preventDefault()
    setIsSaving(true)
    setEmployeeInfoFormError(null)

    try {
      const { data, files } = getEmployeeInfoSubmissionData()
      if (!editingEmployee) throw new Error(t("Create employee first"))

      console.log("Submitting employee info:", {
        data,
        albumFiles: files.album?.map((f) => f.name || f),
      })

      const result = editingEmployee.Employeeinfo
        ? await updateEmployeeInfo(editingEmployee.employeeId, data, files.album)
        : await createEmployeeInfo(
            {
              ...data,
              employeeId: editingEmployee.employeeId,
            },
            files.album,
          )

      if (!result.success) {
        throw new Error(result.error || t("Employee info operation failed"))
      }

      toast.success(t("Employee info saved successfully"))
      await fetchEmployees()
    } catch (err) {
      console.error("Employee info operation error:", err)
      setEmployeeInfoFormError(err.message || t("An error occurred"))
      toast.error(err.message || t("An error occurred"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleEmployeeImagesSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setEmployeeImagesFormError(null)

    try {
      if (!editingEmployee) throw new Error(t("Create employee first"))

      if (!employeeImagesFormData.images || !Array.isArray(employeeImagesFormData.images)) {
        throw new Error(t("No images to upload"))
      }

      const imageFiles = employeeImagesFormData.images.map((img) => {
        if (!img || !img.file || !img.imageType) {
          throw new Error(t("Invalid image data"))
        }
        return {
          file: img.file,
          imageType: img.imageType,
        }
      })

      console.log(
        "Submitting employee images:",
        imageFiles.map((img) => ({ name: img.file.name, type: img.imageType })),
      )

      const result = await uploadEmployeeImages(editingEmployee.employeeId, imageFiles)

      if (!result.success) {
        throw new Error(result.error || t("Employee images upload failed"))
      }

      toast.success(t("Employee images uploaded successfully"))
      handleEmployeeImagesArray("images", []) // Clear images after upload
      await fetchEmployees()
    } catch (err) {
      console.error("Employee images upload error:", err)
      setEmployeeImagesFormError(err.message || t("An error occurred"))
      toast.error(err.message || t("An error occurred"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleEmployeeImageCrop = (formDataArray) => {
    console.log("Received formDataArray:", formDataArray)

    const formDataList = Array.isArray(formDataArray) ? formDataArray : [formDataArray]

    const files = []
    formDataList.forEach((fd, index) => {
      console.log(`FormData ${index} entries:`, Array.from(fd.entries()))

      const file =
        fd.get(`picture_${index}`) || fd.get("picture") || fd.get(`employeeImages_${index}`) || fd.get("employeeImages")

      if (file && file instanceof File) {
        files.push(file)
      }
    })

    console.log(
      "Extracted files:",
      files.map((f) => f.name),
    )

    const imageType = "album" // Default image type for employee additional images
    if (files.length > 0) {
      const newImages = files.map((file) => ({ file, imageType }))
      console.log(
        "New images to add:",
        newImages.map((img) => ({ name: img.file.name, type: img.imageType })),
      )

      handleEmployeeImagesArray("images", [...employeeImagesFormData.images, ...newImages])
    } else {
      console.warn("No valid files found in formDataArray")
    }
  }

  const handleRemoveEmployeeImage = (index) => {
    console.log("Removing image at index:", index)
    removeEmployeeImageFromArray("images", index)
  }

  const handleAlbumImageCrop = (formDataArray) => {
    console.log("Received album formDataArray:", formDataArray)

    const formDataList = Array.isArray(formDataArray) ? formDataArray : [formDataArray]

    const files = []
    formDataList.forEach((fd, index) => {
      console.log(`Album FormData ${index} entries:`, Array.from(fd.entries()))

      const file = fd.get(`picture_${index}`) || fd.get("picture") || fd.get(`album_${index}`) || fd.get("album")

      if (file && file instanceof File) {
        files.push(file)
      }
    })

    console.log(
      "Extracted album files:",
      files.map((f) => f.name),
    )

    if (files.length > 0) {
      handleEmployeeInfoImageArray("album", [...employeeInfoFormData.album, ...files])
    } else {
      console.warn("No valid files found in album formDataArray")
    }
  }

  const handleRemoveAlbumImage = (index) => {
    console.log("Removing album image at index:", index)
    removeEmployeeInfoImageFromArray("album", index)
  }

  const handleEdit = (employee) => {
    if (!canUpdate) return
    setEmployeeFormData({
      employeeCode: employee.employeeCode || "",
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      gender: employee.gender || "male",
      phone: employee.phone || "",
      email: employee.email || "",
      departmentId: employee.departmentId || "",
      positionId: employee.positionId || "",
      branchId: employee.branchId || "",
      salary: employee.salary || 0,
      dob: employee.dob ? new Date(employee.dob) : null,
      hiredDate: employee.hiredDate ? new Date(employee.hiredDate) : null,
      picture: employee.picture || null,
      status: employee.status || "active",
    })
    setEmployeeInfoFormData({
      managerId: employee.Employeeinfo?.managerId || "",
      region: employee.Employeeinfo?.region || "",
      nationality: employee.Employeeinfo?.nationality || "",
      note: employee.Employeeinfo?.note || "",
      maritalStatus: employee.Employeeinfo?.maritalStatus || "single",
      emergencyContact: employee.Employeeinfo?.emergencyContact || "",
      bloodType: employee.Employeeinfo?.bloodType || "",
      bankAccount: employee.Employeeinfo?.bankAccount || "",
      govId: employee.Employeeinfo?.govId || "",
      govExpire: employee.Employeeinfo?.govExpire ? new Date(employee.Employeeinfo.govExpire) : null,
      contractType: employee.Employeeinfo?.contractType || "permanent",
      terminationDate: employee.Employeeinfo?.terminationDate ? new Date(employee.Employeeinfo.terminationDate) : null,
      album: employee.Employeeinfo?.album || [],
      status: employee.Employeeinfo?.status || "active",
    })
    setSelectedDepartment(employee.departmentId || "")
    setEditingEmployee(employee)
    setIsDialogOpen(true)
  }

  const handleDelete = async (employeeId) => {
    if (!canDelete) return
    if (!confirm(t("Are you sure you want to delete this employee?"))) return

    try {
      const result = await deleteEmployee(employeeId)
      if (!result.success) {
        throw new Error(result.error || t("Failed to delete employee"))
      }
      toast.success(t("Employee deleted successfully"))
      await fetchEmployees()
    } catch (err) {
      console.error("Employee deletion error:", err)
      toast.error(err.message || t("Failed to delete employee"))
    }
  }

  const handleRetry = () => {
    fetchEmployees()
    fetchDepartments()
    fetchPositions()
    fetchBranches()
  }

  const handleDialogClose = (open) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingEmployee(null)
      resetEmployeeForm()
      resetEmployeeInfoForm()
      handleEmployeeImagesArray("images", [])
      setSelectedDepartment("")
      setEmployeeFormError(null)
      setEmployeeInfoFormError(null)
      setEmployeeImagesFormError(null)
    }
  }

  const genderOptions = [
    { time: "male", less: t("Male") },
    { time: "female", less: t("Female") },
    { time: "others", less: t("Others") },
  ]

  const statusOptions = [
    { time: "active", less: t("Active") },
    { time: "inactive", less: t("Inactive") },
  ]

  const maritalStatusOptions = [
    { time: "single", less: t("Single") },
    { time: "married", less: t("Married") },
    { time: "divorced", less: t("Divorced") },
    { time: "widowed", less: t("Widowed") },
  ]

  const contractTypeOptions = [
    { time: "permanent", less: t("Permanent") },
    { time: "contract", less: t("Contract") },
    { time: "intern", less: t("Intern") },
    { time: "temporary", less: t("Temporary") },
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

  const departmentOptions = departments.map((dept) => ({
    time: dept.departmentId,
    less: dept.departmentName,
  }))

  const positionOptions = filteredPositions.map((pos) => ({
    time: pos.positionId,
    less: pos.positionName,
  }))

  const branchOptions = branches.map((branch) => ({
    time: branch.branchId,
    less: branch.branchName,
  }))

  const managerOptions = employees.map((emp) => ({
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
          <h1 className="text-3xl font-bold tracking-tight">{t("Employees")}</h1>
          <p className="text-muted-foreground">{t("Manage your workforce and employee information")}</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button
              variant="outline"
              onClick={handleRetry}
              disabled={empLoading || deptLoading || posLoading || branchLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${empLoading || deptLoading || posLoading || branchLoading ? "animate-spin" : ""}`}
              />
              {t("Refresh")}
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button
                disabled={
                  empLoading ||
                  deptLoading ||
                  posLoading ||
                  branchLoading ||
                  !canCreate ||
                  departments.length === 0 ||
                  positions.length === 0 ||
                  branches.length === 0
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Employee")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEmployee ? t("Edit Employee") : t("Add New Employee")}</DialogTitle>
                <DialogDescription>
                  {editingEmployee ? t("Update employee details") : t("Create a new employee record")}
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="employee" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="employee">{t("Employee Details")}</TabsTrigger>
                  <TabsTrigger value="employeeInfo" disabled={!editingEmployee}>
                    {t("Additional Info")}
                  </TabsTrigger>
                  <TabsTrigger value="album" disabled={!editingEmployee}>
                    {t("Album")}
                  </TabsTrigger>
                  <TabsTrigger value="images" disabled={!editingEmployee}>
                    {t("Images")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="employee">
                  <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                    {employeeFormError && <p className="text-red-500 text-sm">{employeeFormError}</p>}
                    <div className="space-y-2">
                      <FormImageResize
                        onCallbackData={(formData) => handleEmployeeImageData("picture", formData.get("picture"))}
                        disabled={isSaving}
                        label={t("Profile Picture")}
                        fieldName="picture"
                      />
                      {employeeFormData.picture && (
                        <FormImagePreview
                          imgSrc={
                            employeeFormData.picture instanceof File
                              ? URL.createObjectURL(employeeFormData.picture)
                              : employeeFormData.picture
                          }
                          height={100}
                          onRemove={() => handleEmployeeImageData("picture", null)}
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        name="employeeCode"
                        disabled={isSaving}
                        label={t("Employee Code")}
                        value={employeeFormData.employeeCode}
                        placeholder={t("Employee Code")}
                        onCallbackInput={handleEmployeeChange}
                      />
                      <FormInput
                        name="firstName"
                        disabled={isSaving}
                        label={t("First Name")}
                        value={employeeFormData.firstName}
                        placeholder={t("First Name")}
                        onCallbackInput={handleEmployeeChange}
                        required
                        error={employeeFormError && !employeeFormData.firstName ? t("First name is required") : null}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        name="lastName"
                        disabled={isSaving}
                        label={t("Last Name")}
                        value={employeeFormData.lastName}
                        placeholder={t("Last Name")}
                        onCallbackInput={handleEmployeeChange}
                        required
                        error={employeeFormError && !employeeFormData.lastName ? t("Last name is required") : null}
                      />
                      <FormComboBox
                        name="gender"
                        label={t("Gender")}
                        item={genderOptions}
                        optID="time"
                        optLabel="less"
                        onCallbackSelect={(value) => handleEmployeeChange("gender", value)}
                        defaultValue={employeeFormData.gender}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormDatePicker
                        label={t("Date of Birth")}
                        date={employeeFormData.dob}
                        onCallbackPicker={(date) => handleEmployeeChange("dob", date)}
                        fromYear={1900}
                        toYear={2025}
                        required
                        error={employeeFormError && !employeeFormData.dob ? t("Date of birth is required") : null}
                      />
                      <FormDatePicker
                        label={t("Hired Date")}
                        date={employeeFormData.hiredDate}
                        onCallbackPicker={(date) => handleEmployeeChange("hiredDate", date)}
                        fromYear={2000}
                        toYear={2025}
                        required
                        error={employeeFormError && !employeeFormData.hiredDate ? t("Hired date is required") : null}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        name="phone"
                        disabled={isSaving}
                        label={t("Phone")}
                        value={employeeFormData.phone}
                        placeholder={t("Phone")}
                        onCallbackInput={handleEmployeeChange}
                        type="tel"
                      />
                      <FormInput
                        name="email"
                        disabled={isSaving}
                        label={t("Email")}
                        value={employeeFormData.email}
                        placeholder={t("Email")}
                        onCallbackInput={handleEmployeeChange}
                        type="email"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormComboBox
                        name="departmentId"
                        label={t("Department")}
                        item={departmentOptions}
                        optID="time"
                        optLabel="less"
                        onCallbackSelect={(value) => {
                          handleEmployeeChange("departmentId", value)
                          setSelectedDepartment(value)
                          handleEmployeeChange("positionId", "")
                        }}
                        defaultValue={employeeFormData.departmentId}
                        required
                        error={employeeFormError && !employeeFormData.departmentId ? t("Department is required") : null}
                        disabled={isSaving || deptLoading}
                      />
                      <FormComboBox
                        name="positionId"
                        label={t("Position")}
                        item={positionOptions}
                        optID="time"
                        optLabel="less"
                        onCallbackSelect={(value) => handleEmployeeChange("positionId", value)}
                        defaultValue={employeeFormData.positionId}
                        required
                        error={employeeFormError && !employeeFormData.positionId ? t("Position is required") : null}
                        disabled={isSaving || posLoading || !selectedDepartment}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormComboBox
                        name="branchId"
                        label={t("Branch")}
                        item={branchOptions}
                        optID="time"
                        optLabel="less"
                        onCallbackSelect={(value) => handleEmployeeChange("branchId", value)}
                        defaultValue={employeeFormData.branchId}
                        disabled={isSaving || branchLoading}
                      />
                      <FormInput
                        name="salary"
                        disabled={isSaving}
                        label={t("Salary")}
                        value={employeeFormData.salary}
                        placeholder={t("Salary")}
                        onCallbackInput={(name, value) => handleEmployeeChange(name, Number.parseFloat(value) || 0)}
                        type="number"
                        step="0.01"
                        required
                        error={
                          employeeFormError && (employeeFormData.salary < 0 || !employeeFormData.salary)
                            ? t("Salary must be non-negative")
                            : null
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormComboBox
                        name="status"
                        label={t("Status")}
                        item={statusOptions}
                        optID="time"
                        optLabel="less"
                        onCallbackSelect={(value) => handleEmployeeChange("status", value)}
                        defaultValue={employeeFormData.status}
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
                            {editingEmployee ? t("Updating...") : t("Creating...")}
                          </>
                        ) : editingEmployee ? (
                          t("Update Employee")
                        ) : (
                          t("Create Employee")
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                <TabsContent value="employeeInfo">
                  <form onSubmit={handleEmployeeInfoSubmit} className="space-y-4">
                    {employeeInfoFormError && <p className="text-red-500 text-sm">{employeeInfoFormError}</p>}
                    <div className="grid grid-cols-2 gap-4">
                      <FormComboBox
                        name="managerId"
                        label={t("Manager")}
                        item={managerOptions}
                        optID="time"
                        optLabel="less"
                        onCallbackSelect={(value) => handleEmployeeInfoChange("managerId", value)}
                        defaultValue={employeeInfoFormData.managerId}
                        disabled={isSaving}
                      />
                      <FormComboBox
                        name="contractType"
                        label={t("Contract Type")}
                        item={contractTypeOptions}
                        optID="time"
                        optLabel="less"
                        onCallbackSelect={(value) => handleEmployeeInfoChange("contractType", value)}
                        defaultValue={employeeInfoFormData.contractType}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        name="region"
                        disabled={isSaving}
                        label={t("Region")}
                        value={employeeInfoFormData.region}
                        placeholder={t("Region")}
                        onCallbackInput={handleEmployeeInfoChange}
                      />
                      <FormInput
                        name="nationality"
                        disabled={isSaving}
                        label={t("Nationality")}
                        value={employeeInfoFormData.nationality}
                        placeholder={t("Nationality")}
                        onCallbackInput={handleEmployeeInfoChange}
                      />
                    </div>
                    <FormTextArea
                      rows={4}
                      name="note"
                      label={t("Notes")}
                      disabled={isSaving}
                      value={employeeInfoFormData.note}
                      onCallbackInput={handleEmployeeInfoChange}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormComboBox
                        name="maritalStatus"
                        label={t("Marital Status")}
                        item={maritalStatusOptions}
                        optID="time"
                        optLabel="less"
                        onCallbackSelect={(value) => handleEmployeeInfoChange("maritalStatus", value)}
                        defaultValue={employeeInfoFormData.maritalStatus}
                        disabled={isSaving}
                      />
                      <FormInput
                        name="emergencyContact"
                        disabled={isSaving}
                        label={t("Emergency Contact")}
                        value={employeeInfoFormData.emergencyContact}
                        placeholder={t("Emergency Contact")}
                        onCallbackInput={handleEmployeeInfoChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        name="bloodType"
                        disabled={isSaving}
                        label={t("Blood Type")}
                        value={employeeInfoFormData.bloodType}
                        placeholder={t("Blood Type")}
                        onCallbackInput={handleEmployeeInfoChange}
                      />
                      <FormInput
                        name="bankAccount"
                        disabled={isSaving}
                        label={t("Bank Account")}
                        value={employeeInfoFormData.bankAccount}
                        placeholder={t("Bank Account")}
                        onCallbackInput={handleEmployeeInfoChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        name="govId"
                        disabled={isSaving}
                        label={t("Government ID")}
                        value={employeeInfoFormData.govId}
                        placeholder={t("Government ID")}
                        onCallbackInput={handleEmployeeInfoChange}
                      />
                      <FormDatePicker
                        label={t("Government ID Expiry")}
                        date={employeeInfoFormData.govExpire}
                        onCallbackPicker={(date) => handleEmployeeInfoChange("govExpire", date)}
                        fromYear={2020}
                        toYear={2030}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormDatePicker
                        label={t("Termination Date")}
                        date={employeeInfoFormData.terminationDate}
                        onCallbackPicker={(date) => handleEmployeeInfoChange("terminationDate", date)}
                        fromYear={2000}
                        toYear={2030}
                      />
                      <FormComboBox
                        name="status"
                        label={t("Status")}
                        item={statusOptions}
                        optID="time"
                        optLabel="less"
                        onCallbackSelect={(value) => handleEmployeeInfoChange("status", value)}
                        defaultValue={employeeInfoFormData.status}
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
                      <Button type="submit" disabled={isSaving || !editingEmployee}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("Saving...")}
                          </>
                        ) : (
                          t("Save Employee Info")
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                <TabsContent value="album">
                  <form onSubmit={handleEmployeeInfoSubmit} className="space-y-4">
                    {employeeInfoFormError && <p className="text-red-500 text-sm">{employeeInfoFormError}</p>}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">{t("Photo Album")}</h3>
                      <FormImageResize
                        onCallbackData={handleAlbumImageCrop}
                        label={t("Photo Album")}
                        multiple
                        maxImages={10}
                        fieldName="album"
                        disabled={isSaving}
                      />
                      {employeeInfoFormData.album &&
                        Array.isArray(employeeInfoFormData.album) &&
                        employeeInfoFormData.album.length > 0 && (
                          <FormImagePreview
                            imgSrc={employeeInfoFormData.album.map((img) =>
                              img instanceof File ? URL.createObjectURL(img) : img,
                            )}
                            label={t("Photo Album Preview")}
                            multiple
                            maxImages={10}
                            onRemove={handleRemoveAlbumImage}
                            height={100}
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
                      <Button type="submit" disabled={isSaving || !editingEmployee}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("Saving...")}
                          </>
                        ) : (
                          t("Save Album")
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                <TabsContent value="images">
                  <form onSubmit={handleEmployeeImagesSubmit} className="space-y-4">
                    {employeeImagesFormError && <p className="text-red-500 text-sm">{employeeImagesFormError}</p>}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("Employee Images")}</label>
                      <FormImageResize
                        onCallbackData={handleEmployeeImageCrop}
                        label={t("Upload Images")}
                        multiple
                        maxImages={5}
                        fieldName="employeeImages"
                        disabled={isSaving}
                      />
                      {employeeImagesFormData.images.length > 0 && (
                        <FormImagePreview
                          imgSrc={employeeImagesFormData.images.map((img) => URL.createObjectURL(img.file))}
                          label={t("Image Preview")}
                          multiple
                          maxImages={5}
                          onRemove={handleRemoveEmployeeImage}
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
                          !editingEmployee ||
                          !employeeImagesFormData.images ||
                          employeeImagesFormData.images.length === 0
                        }
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

      {(empError || deptError || posError || branchError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">{t("Error loading data")}</p>
                <p className="text-sm text-muted-foreground">{empError || deptError || posError || branchError}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleRetry}
                disabled={empLoading || deptLoading || posLoading || branchLoading}
              >
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
                <UserCheck className="h-5 w-5" />
                {t("Employee Directory")}
                {(empLoading || deptLoading || posLoading || branchLoading) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </CardTitle>
              <CardDescription>
                {filteredEmployees.length} {t("employees in your organization")}
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
                placeholder={t("Search employees...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={empLoading || deptLoading || posLoading || branchLoading}
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredEmployees}
              fields={cardFields}
              loading={empLoading || deptLoading || posLoading || branchLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              imageField="picture"
              idField="employeeId"
              nameField="firstName"
              columns={4}
            />
          ) : (
            <DataTable
              data={filteredEmployees}
              columns={tableColumns}
              loading={empLoading || deptLoading || posLoading || branchLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              imageField="picture"
              idField="employeeId"
              nameField="firstName"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
