
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
import { DatePicker } from "@/components/ui/date-picker"
import { ViewToggle } from "@/components/ui/view-toggle"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { Plus, Search, UserCheck, Loader2, RefreshCw, Phone, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { useEmployeeStore } from "@/stores/employee-store"
import { useDepartmentStore } from "@/stores/department-store"
import { usePositionStore } from "@/stores/position-store"

export const dynamic = 'force-dynamic';
export default function EmployeesPage() {
  const {
    items: employees,
    isLoading: empLoading,
    error: empError,
    fetch: fetchEmployees,
    create,
    update,
    delete: deleteEmployee,
  } = useEmployeeStore()

  const {
    items: departments,
    isLoading: deptLoading,
    error: deptError,
    fetch: fetchDepartments,
  } = useDepartmentStore()

  const {
    items: positions,
    isLoading: posLoading,
    error: posError,
    fetch: fetchPositions,
  } = usePositionStore()

  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState("table")
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [dobDate, setDobDate] = useState()
  const [hiredDate, setHiredDate] = useState()

  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
    fetchPositions()
  }, [fetchEmployees, fetchDepartments, fetchPositions])

  const activeEmployees = employees.filter((emp) => emp.status === "active")

  const filteredEmployees = activeEmployees.filter(
    (employee) =>
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredPositions = positions.filter((position) =>
    selectedDepartment ? position.departmentId === selectedDepartment : true,
  )

  // Table columns configuration
  const tableColumns = [
    {
      key: "name",
      label: "Employee",
      render: (_value, row) => (
        <div>
          <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
          {row.employeeCode && (
            <div className="text-sm text-muted-foreground">{row.employeeCode}</div>
          )}
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
          {row.EmployeeInfo?.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              {row.EmployeeInfo.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "Department.departmentName",
      label: "Department",
      render: (_value, row) => row.Department?.departmentName || "-",
    },
    {
      key: "Position.positionName",
      label: "Position",
      render: (_value, row) => row.Position?.positionName || "-",
    },
    {
      key: "salary",
      label: "Salary",
      render: (value) => formatCurrency(value),
    },
    {
      key: "performance",
      label: "Performance",
      render: (_value, row) => (
        <div className="space-y-1">
          <div className="text-sm">Sales: {row._count?.Sale || 0}</div>
          <div className="text-sm text-muted-foreground">Attendance: {row._count?.Attendance || 0}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
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
      key: "employeeCode",
      label: "Employee Code",
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
          {row.EmployeeInfo?.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-4 w-4" />
              {row.EmployeeInfo.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "Department.departmentName",
      label: "Department",
      render: (_value, row) => row.Department?.departmentName || "-",
    },
    {
      key: "Position.positionName",
      label: "Position",
      render: (_value, row) => row.Position?.positionName || "-",
    },
    {
      key: "salary",
      label: "Salary",
      render: (value) => formatCurrency(value),
    },
    {
      key: "performance",
      label: "Performance",
      render: (_value, row) => (
        <div className="space-y-1">
          <div className="text-sm">Sales: {row._count?.Sale || 0}</div>
          <div className="text-sm text-muted-foreground">Attendance: {row._count?.Attendance || 0}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const employeeData = {
      employeeCode: formData.get("employeeCode"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      gender: formData.get("gender"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      departmentId: formData.get("departmentId"),
      positionId: formData.get("positionId"),
      salary: Number.parseFloat(formData.get("salary")),
      dob: dobDate?.toISOString(),
      hiredDate: hiredDate?.toISOString(),
      region: formData.get("region"),
      note: formData.get("note"),
    }

    setIsSaving(true)
    try {
      const success = editingEmployee
        ? await update(editingEmployee.employeeId, employeeData)
        : await create(employeeData)
      setIsSaving(false)

      if (success) {

        setIsDialogOpen(false)
        setEditingEmployee(null)
        setDobDate(undefined)
        setHiredDate(undefined)
        setSelectedDepartment("")
          ; (e.target).reset()
      } else {
        throw new Error("Employee operation failed")
      }
    } catch (error) {
      setIsSaving(false)

    }
  }

  const handleEdit = (employee) => {
    setEditingEmployee(employee)
    setDobDate(employee.dob ? new Date(employee.dob) : undefined)
    setHiredDate(employee.hiredDate ? new Date(employee.hiredDate) : undefined)
    setSelectedDepartment(employee.departmentId || "")
    setIsDialogOpen(true)
  }

  const handleDelete = async (employeeId) => {
    if (!confirm("Are you sure you want to delete this employee?")) return

    const success = await deleteEmployee(employeeId)

  }

  const handleRetry = () => {
    fetchEmployees()
    fetchDepartments()
    fetchPositions()
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage your workforce and employee information</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={empLoading || deptLoading || posLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${empLoading || deptLoading || posLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setEditingEmployee(null)
                setDobDate(undefined)
                setHiredDate(undefined)
                setSelectedDepartment("")
              }
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={departments.length === 0 || positions.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                <DialogDescription>
                  {editingEmployee ? "Update employee details" : "Create a new employee record"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      defaultValue={editingEmployee?.firstName || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      defaultValue={editingEmployee?.lastName || ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <DatePicker
                      date={dobDate}
                      onDateChange={setDobDate}
                      placeholder="Select date of birth"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hired Date</Label>
                    <DatePicker
                      date={hiredDate}
                      onDateChange={setHiredDate}
                      placeholder="Select hired date"
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
                      defaultValue={editingEmployee?.phone || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingEmployee?.EmployeeInfo?.email || ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Department *</Label>
                    <Select
                      name="departmentId"
                      required
                      onValueChange={(value) => setSelectedDepartment(value)}
                      defaultValue={editingEmployee?.departmentId || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.departmentId} value={dept.departmentId}>
                            {dept.departmentName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="positionId">Position *</Label>
                    <Select
                      name="positionId"
                      required
                      defaultValue={editingEmployee?.positionId || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredPositions.map((pos) => (
                          <SelectItem key={pos.positionId} value={pos.positionId}>
                            {pos.positionName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary *</Label>
                    <Input
                      id="salary"
                      name="salary"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={editingEmployee?.salary || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      name="gender"
                      defaultValue={editingEmployee?.gender || "male"}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Notes</Label>
                  <Textarea
                    id="note"
                    name="note"
                    rows={3}
                    defaultValue={editingEmployee?.note || ""}
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
                        {editingEmployee ? "Updating..." : "Creating..."}
                      </>
                    ) : editingEmployee ? (
                      "Update Employee"
                    ) : (
                      "Create Employee"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Error Display */}
      {(empError || deptError || posError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">Error loading data</p>
                <p className="text-sm text-muted-foreground">{empError || deptError || posError}</p>
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
                <UserCheck className="h-5 w-5" />
                Employee Directory
                {(empLoading || deptLoading || posLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredEmployees.length} employees in your organization</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredEmployees}
              fields={cardFields}
              loading={empLoading || deptLoading || posLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="employeeId"
              nameField="firstName"
              columns={3}
            />
          ) : (
            <DataTable
              data={filteredEmployees}
              columns={tableColumns}
              loading={empLoading || deptLoading || posLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="employeeId"
              nameField="firstName"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}


