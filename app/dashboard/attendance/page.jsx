"use client"

export const dynamic = 'force-dynamic';


import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Plus, Search, Calendar, Clock, Edit, Trash2, UserCheck, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useTranslation } from "react-i18next"


export default function AttendancePage() {
  const { t } = useTranslation('common')
  const [attendances, setAttendances] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState(null)

  useEffect(() => {
    fetchAttendances()
    fetchEmployees()
  }, [selectedDate])

  const fetchAttendances = async () => {
    try {
      const url = `/api/attendance?date=${selectedDate}`
      const response = await fetch(url)
      const data = await response.json()
      setAttendances(data.attendances || [])
    } catch (error) {
      console.error("Error fetching attendances:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      const data = await response.json()
      setEmployees(data.employees || [])
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

  const filteredAttendances = attendances.filter(
    (attendance) =>
      attendance.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendance.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendance.employee.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const attendanceData = {
      employeeId: formData.get("employeeId"),
      attendanceDate: formData.get("attendanceDate"),
      checkIn: formData.get("checkIn"),
      checkOut: formData.get("checkOut"),
      status: formData.get("status"),
      note: formData.get("note"),
    }

    try {
      const url = editingAttendance ? `/api/attendance/${editingAttendance.attendanceId}` : "/api/attendance"

      const method = editingAttendance ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingAttendance(null)
        fetchAttendances()
          ; (e.target).reset()
      }
    } catch (error) {
      console.error("Error saving attendance:", error)
    }
  }

  const handleEdit = (attendance) => {
    setEditingAttendance(attendance)
    setIsDialogOpen(true)
  }

  const handleDelete = async (attendanceId) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) return

    try {
      const response = await fetch(`/api/attendance/${attendanceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchAttendances()
      }
    } catch (error) {
      console.error("Error deleting attendance:", error)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      present: "default",
      absent: "destructive",
      late: "secondary",
      halfday: "outline",
    }

    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-"

    const inTime = new Date(checkIn)
    const outTime = new Date(checkOut)
    const diffMs = outTime.getTime() - inTime.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  // Calculate stats
  const presentCount = attendances.filter((a) => a.status === "present").length
  const absentCount = attendances.filter((a) => a.status === "absent").length
  const lateCount = attendances.filter((a) => a.status === "late").length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t
            ("Attendance")}</h1>
          <p className="text-muted-foreground">{t("Track employee attendance and working hours")}</p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingAttendance(null)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t(" Mark Attendance")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingAttendance ? "Edit Attendance" : "Mark Attendance"}</DialogTitle>
              <DialogDescription>
                {editingAttendance ? "Update attendance record" : "Record employee attendance"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">{t("Employee")}</Label>
                  <Select
                    name="employeeId"
                    required
                    defaultValue={
                      editingAttendance?.employee
                        ? employees.find(
                          (e) =>
                            `${e.firstName} ${e.lastName}` ===
                            `${editingAttendance.employee.firstName} ${editingAttendance.employee.lastName}`,
                        )?.employeeId
                        : ""
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.employeeId} value={employee.employeeId}>
                          {employee.firstName} {employee.lastName} ({employee.employeeCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendanceDate">Date</Label>
                  <Input
                    id="attendanceDate"
                    name="attendanceDate"
                    type="date"
                    required
                    defaultValue={editingAttendance?.attendanceDate.split("T")[0] || selectedDate}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">{t("Check In")}</Label>
                  <Input
                    id="checkIn"
                    name="checkIn"
                    type="time"
                    defaultValue={
                      editingAttendance?.checkIn ? new Date(editingAttendance.checkIn).toTimeString().slice(0, 5) : ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">{t("Check Out")}</Label>
                  <Input
                    id="checkOut"
                    name="checkOut"
                    type="time"
                    defaultValue={
                      editingAttendance?.checkOut ? new Date(editingAttendance.checkOut).toTimeString().slice(0, 5) : ""
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t("Status")}</Label>
                <Select name="status" required defaultValue={editingAttendance?.status || "present"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">{t("Present")}</SelectItem>
                    <SelectItem value="absent">{t("Absent")}</SelectItem>
                    <SelectItem value="late">{t("Late")}</SelectItem>
                    <SelectItem value="halfday">{t("Half Day")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">{t("Notes")}</Label>
                <Textarea id="note" name="note" rows={3} defaultValue={editingAttendance?.note || ""} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingAttendance ? "Update" : "Mark"} Attendance</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Attendance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Total Employee")}s</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-muted-foreground">{t("Active employees")}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Present Today")}</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presentCount}</div>
              <p className="text-xs text-muted-foreground">{t("Employees presen")}t</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Absent Toda")}y</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{absentCount}</div>
              <p className="text-xs text-muted-foreground">{t("Employees absent")}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Late Arrival")}s</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lateCount}</div>
              <p className="text-xs text-muted-foreground">{t("Late today")}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("Daily Attendance")}
          </CardTitle>
          <CardDescription>{t("Attendance records for")} {formatDate(selectedDate)}</CardDescription>
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
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Employee")}</TableHead>
                  <TableHead>{t("Department")}</TableHead>
                  <TableHead>{t("Check In")}</TableHead>
                  <TableHead>{t("Check Out")}t</TableHead>
                  <TableHead>{t("Working Hour")}s</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead>{t("Notes")}</TableHead>
                  <TableHead className="text-right">{t("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendances.map((attendance) => (
                  <motion.tr
                    key={attendance.attendanceId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {attendance.employee.firstName} {attendance.employee.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">{attendance.employee.employeeCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{attendance.employee.department.departmentName}</div>
                        <div className="text-xs text-muted-foreground">{attendance.employee.position.positionName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {attendance.checkIn
                        ? new Date(attendance.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {attendance.checkOut
                        ? new Date(attendance.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "-"}
                    </TableCell>
                    <TableCell>{calculateWorkingHours(attendance.checkIn, attendance.checkOut)}</TableCell>
                    <TableCell>{getStatusBadge(attendance.status)}</TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate text-sm">{attendance.note || "-"}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(attendance)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(attendance.attendanceId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
