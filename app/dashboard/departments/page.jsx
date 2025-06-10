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
import { Plus, Search, Building, Loader2, RefreshCw } from "lucide-react"

import { useDepartmentStore } from "@/stores/department-store" // Assuming this exists

export const dynamic = 'force-dynamic';
export default function DepartmentsPage() {
  const {
    items: departments,
    isLoading,
    error,
    fetch,
    create,
    update,
    delete: deleteDepartment,
  } = useDepartmentStore()


  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState("table")
  const [editingDepartment, setEditingDepartment] = useState(null)

  useEffect(() => {
    fetch()
  }, [fetch])

  console.log(departments)

  const activeDepartments = departments.filter((dept) => dept.status === "active")

  const filteredDepartments = activeDepartments.filter(
    (department) =>
      department.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.departmentCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tableColumns = [
    {
      key: "departmentName",
      label: "Department Name",
    },
    {
      key: "departmentCode",
      label: "Department Code",
    },
    {
      key: "_count.employees",
      label: "Employees",
      type: "badge",
      render: (value, row) => row._count?.Employees || 0,
    },
    {
      key: "_count.positions",
      label: "Positions",
      type: "badge",
      render: (value, row) => row._count?.Positions || 0,
    },
    {
      key: "memo",
      label: "Description",
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
      key: "departmentName",
      primary: true,
    },
    {
      key: "departmentCode",
      secondary: true,
    },
    {
      key: "_count.employees",
      label: "Employees",
      type: "badge",
      render: (value, row) => row._count?.employees || 0,
    },
    {
      key: "_count.positions",
      label: "Positions",
      type: "badge",
      render: (value, row) => row._count?.positions || 0,
    },
    {
      key: "memo",
      label: "Description",
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
    const departmentData = {
      departmentName: formData.get("departmentName"),
      departmentCode: formData.get("departmentCode"),
      memo: formData.get("memo"),
    }

    setIsSaving(true)
    try {
      const success = editingDepartment
        ? await update(editingDepartment.departmentId, departmentData)
        : await create(departmentData)
      setIsSaving(false)

      if (success) {

        setIsDialogOpen(false)
        setEditingDepartment(null)
          ; (e.target).reset()
      } else {
        throw new Error("Department operation failed")
      }
    } catch (error) {
      setIsSaving(false)

    }
  }

  const handleEdit = (department) => {
    setEditingDepartment(department)
    setIsDialogOpen(true)
  }

  const handleDelete = async (departmentId) => {
    if (!confirm("Are you sure you want to delete this department?")) return

    const success = await deleteDepartment(departmentId)

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
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage organizational departments and structure</p>
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
              if (!open) setEditingDepartment(null)
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingDepartment ? "Edit Department" : "Add New Department"}</DialogTitle>
                <DialogDescription>
                  {editingDepartment ? "Update department information" : "Create a new department"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="departmentName">Department Name *</Label>
                  <Input
                    id="departmentName"
                    name="departmentName"
                    required
                    defaultValue={editingDepartment?.departmentName || ""}
                  />
                </div>


                <div className="space-y-2">
                  <Label htmlFor="memo">Description</Label>
                  <Textarea id="memo" name="memo" rows={3} defaultValue={editingDepartment?.memo || ""} />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingDepartment ? "Updating..." : "Creating..."}
                      </>
                    ) : editingDepartment ? (
                      "Update Department"
                    ) : (
                      "Create Department"
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
                <Building className="h-5 w-5" />
                Organization Departments
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredDepartments.length} departments in your organization</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredDepartments}
              fields={cardFields}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="departmentId"
              nameField="departmentName"
              columns={3}
            />
          ) : (
            <DataTable
              data={filteredDepartments}
              columns={tableColumns}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="departmentId"
              nameField="departmentName"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}


