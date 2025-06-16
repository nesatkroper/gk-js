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
import { ViewToggle } from "@/components/ui/view-toggle"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { Plus, Search, Briefcase, Loader2, RefreshCw } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useFormHandler } from "@/hooks/use-form"
import { usePositionStore } from "@/stores/position-store"
import { useDepartmentStore } from "@/stores/department-store"
import { FormInput, FormTextArea } from "@/components/form"
import { usePermissions } from "@/hooks/use-permissions"
import { toast } from "sonner"
import { Combobox } from "@/components/ui/combobox"
import { createPosition, updatePosition } from "@/app/actions/positions"

export const dynamic = 'force-dynamic'

export default function PositionsPage() {
  const { t } = useTranslation("common")
  const { canCreate } = usePermissions()
  const {
    items: positions,
    isLoading: posLoading,
    error: posError,
    fetch: fetchPositions,
    delete: deletePosition,
  } = usePositionStore()
  const {
    items: departments,
    isLoading: deptLoading,
    error: deptError,
    fetch: fetchDepartments,
  } = useDepartmentStore()

  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState("table")
  const [editingPosition, setEditingPosition] = useState(null)

  const { formData, resetForm, setFormData, handleChange, getSubmissionData } = useFormHandler({
    positionName: "",
    positionCode: "",
    departmentId: "",
    memo: "",
    status: "active",
  })

  useEffect(() => {
    fetchPositions()
    fetchDepartments()
  }, [fetchPositions, fetchDepartments])

  const activePositions = positions.filter((pos) => pos.status === "active")

  const filteredPositions = activePositions.filter((position) => {
    const matchesSearch =
      position.positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (position.positionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      position.Department.departmentName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment =
      filterDepartment === "all" ||
      departments.find((d) => d.departmentId === filterDepartment)?.departmentId ===
      position.Department.departmentId

    return matchesSearch && matchesDepartment
  })

  const tableColumns = [
    {
      key: "positionName",
      label: t("Position Name"),
    },
    {
      key: "positionCode",
      label: t("Position Code"),
      render: (_value, row) => row.positionCode ?? "-",
    },
    {
      key: "Department.departmentName",
      label: t("Department"),
      render: (_value, row) => row.Department?.departmentName || t("Unknown"),
    },
    {
      key: "Employee.length",
      label: t("Employees"),
      type: "badge",
      render: (_value, row) => row.Employee?.length || 0,
    },
    {
      key: "memo",
      label: t("Description"),
      render: (_value, row) => row.memo ?? "-",
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
  ]

  const cardFields = [
    {
      key: "positionName",
      primary: true,
    },
    {
      key: "positionCode",
      secondary: true,
      render: (_value, row) => row.positionCode ?? "-",
    },
    {
      key: "Department.departmentName",
      label: t("Department"),
      render: (_value, row) => row.Department?.departmentName || t("Unknown"),
    },
    {
      key: "Employee.length",
      label: t("Employees"),
      type: "badge",
      render: (_value, row) => row.Employee?.length || 0,
    },
    {
      key: "memo",
      label: t("Description"),
      render: (_value, row) => row.memo ?? "-",
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
  ]

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { data } = getSubmissionData()

      const result = editingPosition
        ? await updatePosition(editingPosition.positionId, data)
        : await createPosition(data)

      if (!result.success) {
        throw new Error(result.error || t("Position operation failed"))
      }

      toast.success(editingPosition ? t("Position updated successfully") : t("Position created successfully"))

      setIsDialogOpen(false)
      setEditingPosition(null)
      resetForm()

      await fetchPositions()
    } catch (err) {
      console.error("Position operation error:", err)
      toast.error(err.message || t("An error occurred"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (position) => {
    setFormData({
      positionName: position.positionName || "",
      positionCode: position.positionCode || "",
      departmentId: position.departmentId || "",
      memo: position.memo || "",
      status: position.status || "active",
    })
    setEditingPosition(position)
    setIsDialogOpen(true)
  }

  const handleDelete = async (positionId) => {
    if (!confirm(t("Are you sure you want to delete this position?"))) return

    const success = await deletePosition(positionId)
    if (success) {
      toast.success(t("Position deleted successfully"))
    } else {
      toast.error(t("Failed to delete position"))
    }
  }

  const handleRetry = () => {
    fetchPositions()
    fetchDepartments()
  }

  const handleDialogClose = (open) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingPosition(null)
      resetForm()
    }
  }

  const departmentOptions = departments.map((dept) => ({
    value: dept.departmentId,
    label: dept.departmentName,
  }))

  const statusOptions = [
    { value: "active", label: t("Active") },
    { value: "inactive", label: t("Inactive") },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Positions")}</h1>
          <p className="text-muted-foreground">{t("Manage job positions and roles within departments")}</p>
        </div>

        <div className="flex gap-2">
          {canCreate && (
            <Button variant="outline" onClick={handleRetry} disabled={posLoading || deptLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${posLoading || deptLoading ? "animate-spin" : ""}`} />
              {t("Refresh")}
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button disabled={posLoading || deptLoading || departments.length === 0 || !canCreate}>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Position")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingPosition ? t("Edit Position") : t("Add New Position")}</DialogTitle>
                <DialogDescription>
                  {editingPosition ? t("Update position information") : t("Create a new job position")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  name="positionName"
                  disabled={isSaving}
                  label={t("Position Name")}
                  value={formData.positionName}
                  placeholder={t("Position Name")}
                  onCallbackInput={handleChange}
                  required
                />
                <FormInput
                  name="positionCode"
                  disabled={isSaving}
                  label={t("Position Code")}
                  value={formData.positionCode}
                  placeholder={t("Position Code")}
                  onCallbackInput={handleChange}
                />
                <div className="space-y-2">
                  <label htmlFor="departmentId" className="text-sm font-medium">
                    {t("Department")} <span className="text-red-600">*</span>
                  </label>
                  <Combobox
                    id="departmentId"
                    name="departmentId"
                    options={departmentOptions}
                    placeholder={t("Select department")}
                    value={formData.departmentId}
                    onChange={(value) => handleChange("departmentId", value)}
                    disabled={isSaving || departments.length === 0}
                    required
                  />
                </div>
                <FormTextArea
                  rows={4}
                  name="memo"
                  label={t("Memo")}
                  disabled={isSaving}
                  value={formData.memo}
                  onCallbackInput={handleChange}
                />
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    {t("Status")}
                  </label>
                  <Combobox
                    id="status"
                    name="status"
                    options={statusOptions}
                    placeholder={t("Select status")}
                    value={formData.status}
                    onChange={(value) => handleChange("status", value)}
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
                        {editingPosition ? t("Updating...") : t("Creating...")}
                      </>
                    ) : editingPosition ? (
                      t("Update Position")
                    ) : (
                      t("Create Position")
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {(posError || deptError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">{t("Error loading data")}</p>
                <p className="text-sm text-muted-foreground">{posError || deptError}</p>
              </div>
              <Button variant="outline" onClick={handleRetry} disabled={posLoading || deptLoading}>
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
                <Briefcase className="h-5 w-5" />
                {t("Job Positions")}
                {(posLoading || deptLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredPositions.length} {t("positions across all departments")}</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search positions...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={posLoading || deptLoading}
              />
            </div>
            <Combobox
              id="filterDepartment"
              name="filterDepartment"
              options={[{ value: "all", label: t("All Departments") }, ...departmentOptions]}
              placeholder={t("All Departments")}
              value={filterDepartment}
              onChange={setFilterDepartment}
              disabled={posLoading || deptLoading}
            />
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredPositions}
              fields={cardFields}
              loading={posLoading || deptLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="positionId"
              nameField="positionName"
              columns={3}
            />
          ) : (
            <DataTable
              data={filteredPositions}
              columns={tableColumns}
              loading={posLoading || deptLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="positionId"
              nameField="positionName"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}