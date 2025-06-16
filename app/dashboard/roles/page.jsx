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
import { Checkbox } from "@/components/ui/checkbox"
import { ViewToggle } from "@/components/ui/view-toggle"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { Plus, Search, Shield, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import { useRoleStore } from "@/stores/role-store"



export const dynamic = 'force-dynamic';
export default function RolePage() {
  const {
    items: roles,
    isLoading,
    error,
    fetch,
    create,
    update,
    delete: deleteRole,
  } = useRoleStore()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [view, setView] = useState("table")
  const [editingRole, setEditingRole] = useState(null)

  useEffect(() => {
    fetch()
  }, [fetch])

  const activeRoles = roles.filter((role) => role.status === "active")

  const filteredRoles = activeRoles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tableColumns = [
    {
      key: "name",
      label: "Name",
      render: (_value, row) => (
        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4" />
          {row.name}
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (_value, row) => row.description || "-",
    },
    {
      key: "isSystemRole",
      label: "System Role",
      render: (_value, row) => (row.isSystemRole ? "Yes" : "No"),
    },
    {
      key: "createdAt",
      label: "Created",
      type: "date",
      render: (_value, row) => formatDate(row.createdAt),
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
    },
  ]

  const cardFields = [
    {
      key: "name",
      primary: true,
      render: (_value, row) => row.name,
    },
    {
      key: "description",
      label: "Description",
      render: (_value, row) => row.description || "-",
    },
    {
      key: "isSystemRole",
      label: "System Role",
      render: (_value, row) => (row.isSystemRole ? "Yes" : "No"),
    },
    {
      key: "createdAt",
      label: "Created",
      type: "date",
      render: (_value, row) => formatDate(row.createdAt),
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
    },
  ]

  const validateRole = (data) => {
    if (!data.name || data.name.length < 3) {
      return "Role name must be at least 3 characters long"
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const roleData = {
      name: formData.get("name"),
      description: formData.get("description") || null,
      isSystemRole: formData.get("isSystemRole") === "on",
    }

    const validationError = validateRole(roleData)
    if (validationError) {
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const success = editingRole
        ? await update(editingRole.roleId, roleData)
        : await create(roleData)
      setIsSaving(false)

      if (success) {
        toast({
          title: "Success",
          description: `Role ${editingRole ? "updated" : "created"} successfully`,
        })
        setIsDialogOpen(false)
        setEditingRole(null)
          ; (e.target).reset()
      } else {
        throw new Error("Role operation failed")
      }
    } catch (error) {
      setIsSaving(false)
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingRole ? "update" : "create"} role`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (role) => {
    setEditingRole(role)
    setIsDialogOpen(true)
  }

  const handleDelete = async (roleId) => {
    const role = roles.find((r) => r.roleId === roleId)
    if (role?.isSystemRole) {
      toast({
        title: "Error",
        description: "Cannot delete system roles",
        variant: "destructive",
      })
      return
    }

    if (!confirm("Are you sure you want to delete this role?")) return

    try {
      const success = await deleteRole(roleId)
      if (success) {
        toast({
          title: "Success",
          description: "Role deleted successfully",
        })
      } else {
        throw new Error("Failed to delete role")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
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
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
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
              if (!open) setEditingRole(null)
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingRole ? "Edit Role" : "Add New Role"}</DialogTitle>
                <DialogDescription>
                  {editingRole ? "Update role details" : "Create a new role"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={editingRole?.name || ""}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    defaultValue={editingRole?.description || ""}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isSystemRole"
                    name="isSystemRole"
                    defaultChecked={editingRole?.isSystemRole || false}
                    disabled={isSaving || (editingRole && editingRole.isSystemRole)}
                  />
                  <Label htmlFor="isSystemRole">System Role</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingRole ? "Updating..." : "Creating..."}
                      </>
                    ) : editingRole ? (
                      "Update Role"
                    ) : (
                      "Create Role"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">Error loading roles</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
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
                <Shield className="h-5 w-5" />
                Role Directory
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredRoles.length} active roles</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredRoles}
              fields={cardFields}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="roleId"
              nameField="name"
              columns={3}
            />
          ) : (
            <DataTable
              data={filteredRoles}
              columns={tableColumns}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="roleId"
              nameField="name"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

