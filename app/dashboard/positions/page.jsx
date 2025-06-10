
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Search, Briefcase, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { usePositionStore } from "@/stores/position-store"
import { useDepartmentStore } from "@/stores/department-store"

export const dynamic = 'force-dynamic';
export default function PositionsPage() {
  const {
    items: positions,
    isLoading: posLoading,
    error: posError,
    fetch: fetchPositions,
    create,
    update,
    delete: deletePosition,
  } = usePositionStore()

  const {
    items: departments,
    isLoading: deptLoading,
    error: deptError,
    fetch: fetchDepartments,
  } = useDepartmentStore()

  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState < "table" | "card" > ("table")
  const [editingPosition, setEditingPosition] = useState < any > (null)

  useEffect(() => {
    fetchPositions()
    fetchDepartments()
  }, [fetchPositions, fetchDepartments])

  const activePositions = positions.filter((pos) => pos.status === "active")

  const filteredPositions = activePositions.filter((position) => {
    const matchesSearch =
      position.positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.positionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.Department.departmentName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment =
      filterDepartment === "all" ||
      departments.find((d) => d.departmentId === filterDepartment)?.departmentName ===
      position.Department.departmentName

    return matchesSearch && matchesDepartment
  })

  // Table columns configuration
  const tableColumns = [
    {
      key: "positionName",
      label: "Position",
    },
    {
      key: "positionCode",
      label: "Code",
    },
    {
      key: "department.departmentName",
      label: "Department",
      render: (value, row) => row.Department?.departmentName || "Unknown",
    },
    {
      key: "_count.employees",
      label: "Employees",
      type: "badge",
      render: (value, row) => row._count?.Employees || 0,
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
      key: "positionName",
      primary: true,
    },
    {
      key: "positionCode",
      secondary: true,
    },
    {
      key: "department.departmentName",
      label: "Department",
      render: (value, row) => row.Department?.departmentName || "Unknown",
    },
    {
      key: "_count.employees",
      label: "Employees",
      type: "badge",
      render: (value, row) => row._count?.Employees || 0,
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
    const positionData = {
      positionName: formData.get("positionName"),
      positionCode: formData.get("positionCode"),
      departmentId: formData.get("departmentId"),
      memo: formData.get("memo"),
    }

    setIsSaving(true)
    try {
      const success = editingPosition
        ? await update(editingPosition.positionId, positionData)
        : await create(positionData)
      setIsSaving(false)

      if (success) {
        toast({
          title: "Success",
          description: `Position ${editingPosition ? "updated" : "created"} successfully`,
        })
        setIsDialogOpen(false)
        setEditingPosition(null)
          ; (e.target).reset()
      } else {
        throw new Error("Position operation failed")
      }
    } catch (error) {
      setIsSaving(false)
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingPosition ? "update" : "create"} position`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (position) => {
    setEditingPosition(position)
    setIsDialogOpen(true)
  }

  const handleDelete = async (positionId) => {
    if (!confirm("Are you sure you want to delete this position?")) return

    const success = await deletePosition(positionId)
    if (success) {
      toast({
        title: "Success",
        description: "Position deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete position",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    fetchPositions()
    fetchDepartments()
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Positions</h1>
          <p className="text-muted-foreground">Manage job positions and roles within departments</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={posLoading || deptLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${posLoading || deptLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) setEditingPosition(null)
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={departments.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Position
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingPosition ? "Edit Position" : "Add New Position"}</DialogTitle>
                <DialogDescription>
                  {editingPosition ? "Update position information" : "Create a new job position"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="positionName">Position Name *</Label>
                  <Input
                    id="positionName"
                    name="positionName"
                    required
                    defaultValue={editingPosition?.positionName || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departmentId">Department *</Label>
                  <Select
                    name="departmentId"
                    required
                    defaultValue={
                      editingPosition
                        ? departments.find((d) => d.departmentName === editingPosition.department.departmentName)
                          ?.departmentId
                        : ""
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.length > 0 ? (
                        departments.map((department) => (
                          <SelectItem key={department.departmentId} value={department.departmentId}>
                            {department.departmentName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-departments" disabled>
                          No departments available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>




                <div className="space-y-2">
                  <Label htmlFor="memo">Description</Label>
                  <Textarea id="memo" name="memo" rows={3} defaultValue={editingPosition?.memo || ""} />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingPosition ? "Updating..." : "Creating..."}
                      </>
                    ) : editingPosition ? (
                      "Update Position"
                    ) : (
                      "Create Position"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Error Display */}
      {(posError || deptError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">Error loading data</p>
                <p className="text-sm text-muted-foreground">{posError || deptError}</p>
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
                <Briefcase className="h-5 w-5" />
                Job Positions
                {(posLoading || deptLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredPositions.length} positions across all departments</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.departmentId} value={department.departmentId}>
                    {department.departmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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



// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
// import { Plus, Search, Briefcase, Edit, Trash2, Eye, Users } from "lucide-react"
// import { formatDate } from "@/lib/utils"

// interface Position {
//   positionId: string
//   positionName: string
//   positionCode: string
//   memo: string | null
//   status: string
//   createdAt: string
//   department: {
//     departmentName: string
//   }
//   _count: {
//     employees: number
//   }
// }

// interface Department {
//   departmentId: string
//   departmentName: string
// }

// export default function PositionsPage() {
//   const [positions, setPositions] = useState<Position[]>([])
//   const [departments, setDepartments] = useState<Department[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [filterDepartment, setFilterDepartment] = useState("all")
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [editingPosition, setEditingPosition] = useState<Position | null>(null)

//   useEffect(() => {
//     fetchPositions()
//     fetchDepartments()
//   }, [])

//   const fetchPositions = async () => {
//     try {
//       const response = await fetch("/api/positions")
//       const data = await response.json()
//       setPositions(data || [])
//     } catch (error) {
//       console.error("Error fetching positions:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchDepartments = async () => {
//     try {
//       const response = await fetch("/api/departments")
//       const data = await response.json()
//       setDepartments(data || [])
//     } catch (error) {
//       console.error("Error fetching departments:", error)
//     }
//   }

//   const filteredPositions = positions.filter((position) => {
//     const matchesSearch =
//       position.positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       position.positionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       position.department.departmentName.toLowerCase().includes(searchTerm.toLowerCase())

//     const matchesDepartment =
//       filterDepartment === "all" ||
//       departments.find((d) => d.departmentId === filterDepartment)?.departmentName ===
//         position.department.departmentName

//     return matchesSearch && matchesDepartment
//   })

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     const formData = new FormData(e.currentTarget)

//     const positionData = {
//       positionName: formData.get("positionName"),
//       positionCode: formData.get("positionCode"),
//       departmentId: formData.get("departmentId"),
//       memo: formData.get("memo"),
//     }

//     try {
//       const url = editingPosition ? `/api/positions/${editingPosition.positionId}` : "/api/positions"
//       const method = editingPosition ? "PUT" : "POST"

//       const response = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(positionData),
//       })

//       if (response.ok) {
//         setIsDialogOpen(false)
//         setEditingPosition(null)
//         fetchPositions()
//         ;(e.target as HTMLFormElement).reset()
//       }
//     } catch (error) {
//       console.error("Error saving position:", error)
//     }
//   }

//   const handleEdit = (position: Position) => {
//     setEditingPosition(position)
//     setIsDialogOpen(true)
//   }

//   const handleDelete = async (positionId: string) => {
//     if (!confirm("Are you sure you want to delete this position?")) return

//     try {
//       const response = await fetch(`/api/positions/${positionId}`, {
//         method: "DELETE",
//       })

//       if (response.ok) {
//         fetchPositions()
//       }
//     } catch (error) {
//       console.error("Error deleting position:", error)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Positions</h1>
//           <p className="text-muted-foreground">Manage job positions and roles within departments</p>
//         </div>

//         <Dialog
//           open={isDialogOpen}
//           onOpenChange={(open) => {
//             setIsDialogOpen(open)
//             if (!open) setEditingPosition(null)
//           }}
//         >
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               Add Position
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[500px]">
//             <DialogHeader>
//               <DialogTitle>{editingPosition ? "Edit Position" : "Add New Position"}</DialogTitle>
//               <DialogDescription>
//                 {editingPosition ? "Update position information" : "Create a new job position"}
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="departmentId">Department</Label>
//                 <Select
//                   name="departmentId"
//                   required
//                   defaultValue={
//                     editingPosition
//                       ? departments.find((d) => d.departmentName === editingPosition.department.departmentName)
//                           ?.departmentId
//                       : ""
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select department" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {departments.map((department) => (
//                       <SelectItem key={department.departmentId} value={department.departmentId}>
//                         {department.departmentName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="positionName">Position Name</Label>
//                   <Input
//                     id="positionName"
//                     name="positionName"
//                     required
//                     defaultValue={editingPosition?.positionName || ""}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="positionCode">Position Code</Label>
//                   <Input id="positionCode" name="positionCode" defaultValue={editingPosition?.positionCode || ""} />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="memo">Description</Label>
//                 <Textarea id="memo" name="memo" rows={3} defaultValue={editingPosition?.memo || ""} />
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">{editingPosition ? "Update" : "Create"} Position</Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </motion.div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Briefcase className="h-5 w-5" />
//             Job Positions
//           </CardTitle>
//           <CardDescription>{filteredPositions.length} positions across all departments</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search positions..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <Select value={filterDepartment} onValueChange={setFilterDepartment}>
//               <SelectTrigger className="w-48">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Departments</SelectItem>
//                 {departments.map((department) => (
//                   <SelectItem key={department.departmentId} value={department.departmentId}>
//                     {department.departmentName}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Position</TableHead>
//                   <TableHead>Code</TableHead>
//                   <TableHead>Department</TableHead>
//                   <TableHead>Employees</TableHead>
//                   <TableHead>Description</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Created</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredPositions.map((position) => (
//                   <motion.tr
//                     key={position.positionId}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="group"
//                   >
//                     <TableCell>
//                       <div className="font-medium">{position.positionName}</div>
//                     </TableCell>
//                     <TableCell>
//                       <div className="text-sm text-muted-foreground">{position.positionCode || "-"}</div>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant="outline">{position.department?.departmentName}</Badge>
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex items-center gap-1">
//                         <Users className="h-4 w-4" />
//                         <Badge variant="secondary">{position._count.employees}</Badge>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <div className="max-w-48 truncate text-sm">{position.memo || "-"}</div>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant={position.status === "active" ? "default" : "secondary"}>{position.status}</Badge>
//                     </TableCell>
//                     <TableCell>{formatDate(position.createdAt)}</TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <Button variant="ghost" size="sm">
//                           <Eye className="h-4 w-4" />
//                         </Button>
//                         <Button variant="ghost" size="sm" onClick={() => handleEdit(position)}>
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         <Button variant="ghost" size="sm" onClick={() => handleDelete(position.positionId)}>
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </motion.tr>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
