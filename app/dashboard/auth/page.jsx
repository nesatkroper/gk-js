"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViewToggle } from "@/components/ui/view-toggle";
import { DataTable } from "@/components/ui/data-table";
import { DataCards } from "@/components/ui/data-cards";
import { Plus, Search, Lock, Loader2, RefreshCw, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuthenticationStore } from "@/stores/authentication-store";
import { useRoleStore } from "@/stores/role-store";
import { useEmployeeStore } from "@/stores/employee-store";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "@/components/ui/use-toast";

export default function AuthPage() {
  const { t } = useTranslation("common");
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const {
    items: auths,
    isLoading: authLoading,
    error: authError,
    fetch: fetchAuths,
    create,
    update,
    delete: deleteAuth,
  } = useAuthenticationStore();
  const {
    items: roles,
    isLoading: roleLoading,
    error: roleError,
    fetch: fetchRoles,
  } = useRoleStore();
  const {
    items: employees,
    isLoading: empLoading,
    error: empError,
    fetch: fetchEmployees,
  } = useEmployeeStore();

  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState("table");
  const [editingAuth, setEditingAuth] = useState(null);

  useEffect(() => {
    fetchAuths();
    fetchRoles();
    fetchEmployees();
  }, [fetchAuths, fetchRoles, fetchEmployees]);

  const activeAuths = auths.filter((auth) => auth.status === "active");

  const filteredAuths = activeAuths.filter(
    (auth) =>
      auth.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (auth.Employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (auth.Employee?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (auth.Role?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
  );

  const tableColumns = [
    {
      key: "email",
      label: "Email",
      render: (value, row) => (
        <div className="flex items-center gap-1">
          <Mail className="h-4 w-4" />
          {row.email}
        </div>
      ),
    },
    {
      key: "employee",
      label: "Employee",
      render: (value, row) =>
        row.Employee ? `${row.Employee.firstName} ${row.Employee.lastName}` : "-",
    },
    {
      key: "role",
      label: "Role",
      render: (value, row) => row.Role?.name ?? "-",
    },
    {
      key: "lastLoginAt",
      label: "Last Login",
      type: "date",
      render: (value, row) => formatDate(row.lastLoginAt),
    },
    {
      key: "createdAt",
      label: "Created",
      type: "date",
      render: (value, row) => formatDate(row.createdAt),
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
    },
  ];

  const cardFields = [
    {
      key: "email",
      primary: true,
      render: (value, row) => row.email,
    },
    {
      key: "employee",
      label: "Employee",
      render: (value, row) =>
        row.Employee ? `${row.Employee.firstName} ${row.Employee.lastName}` : "-",
    },
    {
      key: "role",
      label: "Role",
      render: (value, row) => row.Role?.name ?? "-",
    },
    {
      key: "lastLoginAt",
      label: "Last Login",
      type: "date",
      render: (value, row) => formatDate(row.lastLoginAt),
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
      render: (value, row) => formatDate(row.createdAt),
    },
  ];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const authData = {
      email: formData.get("email"),
      password: formData.get("password"),
      roleId: formData.get("roleId"),
      employeeId: formData.get("employeeId") === "none" ? null : formData.get("employeeId"),
    };

    if (!roles.find((r) => String(r.roleId) === authData.roleId)) {
      toast({
        title: "Error",
        description: "Invalid role selected",
        variant: "destructive",
      });
      return;
    }

    if (authData.employeeId && !employees.find((e) => String(e.employeeId) === authData.employeeId)) {
      toast({
        title: "Error",
        description: "Invalid employee selected",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(authData.email)) {
      toast({
        title: "Error",
        description: "Invalid email format",
        variant: "destructive",
      });
      return;
    }

    if (!editingAuth && !authData.password) {
      toast({
        title: "Error",
        description: "Password is required for new auth",
        variant: "destructive",
      });
      return;
    }

    if (authData.password && !validatePassword(authData.password)) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (!authData.roleId) {
      toast({
        title: "Error",
        description: "Role is required",
        variant: "destructive",
      });
      return;
    }

    if (editingAuth && !authData.password) {
      formData.delete("password");
    }

    setIsSaving(true);
    try {
      const success = editingAuth
        ? await update(editingAuth.authId, formData)
        : await create(formData);
      setIsSaving(false);
      if (success) {
        toast({
          title: "Success",
          description: `Auth record ${editingAuth ? "updated" : "created"} successfully`,
        });
        setIsDialogOpen(false);
        setEditingAuth(null);
        e.target.reset();
      } else {
        throw new Error("Auth operation failed");
      }
    } catch (error) {
      setIsSaving(false);
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingAuth ? "update" : "create"} auth record`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (auth) => {
    setEditingAuth(auth);
    setIsDialogOpen(true);
  };

  const handleDelete = async (authId) => {
    if (!confirm("Are you sure you want to delete this auth record?")) return;

    try {
      const success = await deleteAuth(authId);
      if (success) {
        toast({
          title: "Success",
          description: "Auth record deleted successfully",
        });
      } else {
        throw new Error("Failed to delete auth record");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete auth record",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    fetchAuths();
    fetchRoles();
    fetchEmployees();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Auth Management")}</h1>
          <p className="text-muted-foreground">{t("Manage user authentication and roles")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={authLoading || roleLoading || empLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${authLoading || roleLoading || empLoading ? "animate-spin" : ""}`}
            />
            {t("Refresh")}
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingAuth(null);
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={roles.length === 0 || authLoading || roleLoading || !canCreate}>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Auth")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingAuth ? "Edit Auth" : "Add New Auth"}</DialogTitle>
                <DialogDescription>
                  {editingAuth ? "Update auth details" : "Create a new auth record"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("Email")} *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue={editingAuth?.email ?? ""}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{editingAuth ? "New Password (optional)" : "Password *"}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required={!editingAuth}
                    placeholder={editingAuth ? "Leave blank to keep current password" : ""}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleId">{t("Role")} *</Label>
                  <Select
                    name="roleId"
                    required
                    defaultValue={editingAuth?.roleId ? String(editingAuth.roleId) : (roles.length > 0 ? String(roles[0].roleId) : "")}
                    disabled={isSaving || roles.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={roles.length === 0 ? "No roles available" : "Select role"} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.roleId} value={String(r.roleId)}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">{t("Employee")}</Label>
                  <Select
                    name="employeeId"
                    defaultValue={editingAuth?.employeeId ? String(editingAuth.employeeId) : "none"}
                    disabled={isSaving || employees.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={employees.length === 0 ? "No employees available" : "Select employee"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("No Employee")}</SelectItem>
                      {employees.map((e) => (
                        <SelectItem key={e.employeeId} value={String(e.employeeId)}>
                          {e.employeeCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSaving}
                  >
                    {t("Cancel")}
                  </Button>
                  <Button type="submit" disabled={isSaving || !canCreate}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingAuth ? "Updating..." : "Creating..."}
                      </>
                    ) : editingAuth ? (
                      "Update Auth"
                    ) : (
                      "Create Auth"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>
      {(authError || roleError || empError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">{t("Error loading data")}</p>
                <p className="text-sm text-muted-foreground">{authError || roleError || empError}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleRetry}
                disabled={authLoading || roleLoading || empLoading}
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
                <Lock className="h-5 w-5" />
                Auth Directory
                {(authLoading || roleLoading || empLoading) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </CardTitle>
              <CardDescription>{filteredAuths.length} active auth records</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search auth records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={authLoading || roleLoading || empLoading}
              />
            </div>
          </div>
          {view === "card" ? (
            <DataCards
              data={filteredAuths}
              fields={cardFields}
              loading={authLoading || roleLoading || empLoading}
              onEdit={canUpdate ? handleEdit : undefined}
              onDelete={canDelete ? handleDelete : undefined}
              idField="authId"
              nameField="email"
              columns={3}
            />
          ) : (
            <DataTable
              data={filteredAuths}
              columns={tableColumns}
              loading={authLoading || roleLoading || empLoading}
              onEdit={canUpdate ? handleEdit : undefined}
              onDelete={canDelete ? handleDelete : undefined}
              idField="authId"
              nameField="email"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

