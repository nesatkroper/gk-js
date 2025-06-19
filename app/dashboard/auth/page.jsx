"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useFormHandler } from "@/hooks/use-form";
import { useAuthenticationStore } from "@/stores/authentication-store";
import { useRoleStore } from "@/stores/role-store";
import { useEmployeeStore } from "@/stores/employee-store";
import { DataTable } from "@/components/ui/data-table";
import { DataCards } from "@/components/ui/data-cards";
import { ViewToggle } from "@/components/ui/view-toggle";
import { FormInput } from "@/components/form";
import { Combobox } from "@/components/ui/combobox";
import { Plus, Search, Lock, Loader2, RefreshCw, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { createAuthRecord, updateAuthRecord } from "@/app/actions/auth";

export default function AuthPage() {
  const { t } = useTranslation("common");
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const {
    items: auths,
    isLoading: authLoading,
    error: authError,
    fetch: fetchAuths,
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
  const [view, setView] = useState("table");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAuth, setEditingAuth] = useState(null);

  const { formData, resetForm, setFormData, handleChange, getSubmissionData } = useFormHandler({
    email: "",
    password: "",
    roleId: roles.length > 0 ? String(roles[0].roleId) : "",
    employeeId: null,
  });

  useEffect(() => {
    fetchAuths();
    fetchRoles();
    fetchEmployees('basic');
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
      label: t("Email"), // Translated
      render: (value, row) => (
        <div className="flex items-center gap-1">
          <Mail className="h-4 w-4" />
          {row.email}
        </div>
      ),
    },
    {
      key: "employee",
      label: t("Employee"), // Translated
      render: (value, row) =>
        row.Employee ? `${row.Employee.firstName} ${row.Employee.lastName}` : "-",
    },
    {
      key: "role",
      label: t("Role"), // Translated
      render: (value, row) => row.Role?.name ?? "-",
    },
    {
      key: "lastLoginAt",
      label: t("Last Login"), // Translated
      type: "date",
      render: (value, row) => formatDate(row.lastLoginAt),
    },
    {
      key: "createdAt",
      label: t("Created"), // Translated
      type: "date",
      render: (value, row) => formatDate(row.createdAt),
    },
    {
      key: "status",
      label: t("Status"), // Translated
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
      label: t("Employee"), // Translated
      render: (value, row) =>
        row.Employee ? `${row.Employee.firstName} ${row.Employee.lastName}` : "-",
    },
    {
      key: "role",
      label: t("Role"), // Translated
      render: (value, row) => row.Role?.name ?? "-",
    },
    {
      key: "lastLoginAt",
      label: t("Last Login"), // Translated
      type: "date",
      render: (value, row) => formatDate(row.lastLoginAt),
    },
    {
      key: "status",
      label: t("Status"), // Translated
      type: "badge",
    },
    {
      key: "createdAt",
      label: t("Created"), // Translated
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

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data } = getSubmissionData();
      console.log(data)

      if (!roles.find((r) => String(r.roleId) === data.roleId)) {
        throw new Error(t("Invalid role selected")); // Translated
      }

      if (data.employeeId && data.employeeId !== "none" && !employees.find((e) => String(e.employeeId) === data.employeeId)) {
        throw new Error(t("Invalid employee selected")); // Translated
      }

      if (!validateEmail(data.email)) {
        throw new Error(t("Invalid email format")); // Translated
      }

      if (!editingAuth && !data.password) {
        throw new Error(t("Password is required for new auth")); // Translated
      }

      if (data.password && !validatePassword(data.password)) {
        throw new Error(t("Password must be at least 6 characters")); // Translated
      }

      if (!data.roleId) {
        throw new Error(t("Role is required")); // Translated
      }

      if (editingAuth && !data.password) {
        delete data.password;
      }

      const result = editingAuth
        ? await updateAuthRecord(editingAuth.authId, formData)
        : await createAuthRecord(formData);

      toast.success(editingAuth ? t("Auth updated successfully") : t("Auth created successfully")); // Translated
      setIsDialogOpen(false);
      setEditingAuth(null);
      resetForm();
      await fetchAuths();
    } catch (err) {
      console.error("Auth operation error:", err);
      toast.error(err.message || t("An error occurred")); // Translated
    } finally {
      setIsSaving(false);
    }
  }

  const handleEdit = (auth) => {
    setFormData({
      email: auth.email || "",
      password: "",
      roleId: auth.roleId ? String(auth.roleId) : (roles.length > 0 ? String(roles[0].roleId) : ""),
      employeeId: auth.employeeId ? String(auth.employeeId) : "none",
    });
    setEditingAuth(auth);
    setIsDialogOpen(true);
  };

  const handleDelete = async (authId) => {
    if (!confirm(t("Are you sure you want to delete this auth record?"))) return; // Translated

    try {
      const success = await deleteAuth(authId);
      if (!success) {
        throw new Error(t("Failed to delete auth record")); // Translated
      }
      toast.success(t("Auth record deleted successfully")); // Translated
    } catch (error) {
      toast.error(error.message || t("Failed to delete auth record")); // Translated
    }
  };

  const handleRetry = () => {
    fetchAuths();
    fetchRoles();
    fetchEmployees();
  };

  const handleDialogClose = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingAuth(null);
      resetForm();
    }
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
          {canCreate && (
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
          )}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button disabled={roles.length === 0 || authLoading || roleLoading || !canCreate}>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Auth")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingAuth ? t("Edit Auth") : t("Add New Auth")}</DialogTitle>
                <DialogDescription>
                  {editingAuth ? t("Update auth details") : t("Create a new auth record")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  name="email"
                  disabled={isSaving}
                  label={t("Email")}
                  value={formData.email}
                  placeholder={t("Email")}
                  onCallbackInput={handleChange}
                  required
                  type="email"
                />
                <FormInput
                  name="password"
                  disabled={isSaving}
                  label={editingAuth ? t("New Password (optional)") : t("Password")}
                  value={formData.password}
                  placeholder={editingAuth ? t("Leave blank to keep current password") : t("Password")}
                  onCallbackInput={handleChange}
                  required={!editingAuth}
                  type="password"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Combobox
                    name="roleId"
                    label={t("Role")}
                    options={roles.map((r) => ({
                      value: String(r.roleId),
                      label: r.name,
                    }))}
                    value={formData.roleId}
                    onChange={(value) => handleChange({ target: { name: "roleId", value } })}
                    disabled={isSaving || roles.length === 0}
                    placeholder={roles.length === 0 ? t("No roles available") : t("Select role")}
                    required
                  />
                  <Combobox
                    name="employeeId"
                    label={t("Employee")}
                    options={[
                      { value: "none", label: t("No Employee") },
                      ...employees.map((e) => ({
                        value: String(e.employeeId),
                        label: e.employeeCode,
                      })),
                    ]}
                    value={formData.employeeId}
                    onChange={(value) => handleChange({ target: { name: "employeeId", value } })}
                    disabled={isSaving || employees.length === 0}
                    placeholder={employees.length === 0 ? t("No employees available") : t("Select employee")}
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
                  <Button type="submit" disabled={isSaving || !canCreate}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingAuth ? t("Updating...") : t("Creating...")}
                      </>
                    ) : editingAuth ? (
                      t("Update Auth")
                    ) : (
                      t("Create Auth")
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
                {t("Auth Directory")}
                {(authLoading || roleLoading || empLoading) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </CardTitle>
              <CardDescription>{filteredAuths.length} {t("active auth records")}</CardDescription> {/* Translated */}
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search auth records...")} // Translated
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



// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Input } from "@/components/ui/input";
// import { useTranslation } from "react-i18next";
// import { Button } from "@/components/ui/button";
// import { useFormHandler } from "@/hooks/use-form";
// import { useAuthenticationStore } from "@/stores/authentication-store";
// import { useRoleStore } from "@/stores/role-store";
// import { useEmployeeStore } from "@/stores/employee-store";
// import { DataTable } from "@/components/ui/data-table";
// import { DataCards } from "@/components/ui/data-cards";
// import { ViewToggle } from "@/components/ui/view-toggle";
// import { FormInput } from "@/components/form";
// import { Combobox } from "@/components/ui/combobox";
// import { Plus, Search, Lock, Loader2, RefreshCw, Mail } from "lucide-react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { usePermissions } from "@/hooks/use-permissions";
// import { toast } from "sonner";
// import { formatDate } from "@/lib/utils";
// import { createAuthRecord, updateAuthRecord } from "@/app/actions/auth";

// export default function AuthPage() {
//   const { t } = useTranslation("common");
//   const { canCreate, canUpdate, canDelete } = usePermissions();
//   const {
//     items: auths,
//     isLoading: authLoading,
//     error: authError,
//     fetch: fetchAuths,
//     delete: deleteAuth,
//   } = useAuthenticationStore();
//   const {
//     items: roles,
//     isLoading: roleLoading,
//     error: roleError,
//     fetch: fetchRoles,
//   } = useRoleStore();
//   const {
//     items: employees,
//     isLoading: empLoading,
//     error: empError,
//     fetch: fetchEmployees,
//   } = useEmployeeStore();

//   const [isSaving, setIsSaving] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [view, setView] = useState("table");
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingAuth, setEditingAuth] = useState(null);

//   const { formData, resetForm, setFormData, handleChange, getSubmissionData } = useFormHandler({
//     email: "",
//     password: "",
//     roleId: roles.length > 0 ? String(roles[0].roleId) : "",
//     employeeId: null,
//   });

//   useEffect(() => {
//     fetchAuths();
//     fetchRoles();
//     fetchEmployees('basic');
//   }, [fetchAuths, fetchRoles, fetchEmployees]);

//   const activeAuths = auths.filter((auth) => auth.status === "active");

//   const filteredAuths = activeAuths.filter(
//     (auth) =>
//       auth.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (auth.Employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
//       (auth.Employee?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
//       (auth.Role?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
//   );

//   const tableColumns = [
//     {
//       key: "email",
//       label: "Email",
//       render: (value, row) => (
//         <div className="flex items-center gap-1">
//           <Mail className="h-4 w-4" />
//           {row.email}
//         </div>
//       ),
//     },
//     {
//       key: "employee",
//       label: "Employee",
//       render: (value, row) =>
//         row.Employee ? `${row.Employee.firstName} ${row.Employee.lastName}` : "-",
//     },
//     {
//       key: "role",
//       label: "Role",
//       render: (value, row) => row.Role?.name ?? "-",
//     },
//     {
//       key: "lastLoginAt",
//       label: "Last Login",
//       type: "date",
//       render: (value, row) => formatDate(row.lastLoginAt),
//     },
//     {
//       key: "createdAt",
//       label: "Created",
//       type: "date",
//       render: (value, row) => formatDate(row.createdAt),
//     },
//     {
//       key: "status",
//       label: "Status",
//       type: "badge",
//     },
//   ];

//   const cardFields = [
//     {
//       key: "email",
//       primary: true,
//       render: (value, row) => row.email,
//     },
//     {
//       key: "employee",
//       label: "Employee",
//       render: (value, row) =>
//         row.Employee ? `${row.Employee.firstName} ${row.Employee.lastName}` : "-",
//     },
//     {
//       key: "role",
//       label: "Role",
//       render: (value, row) => row.Role?.name ?? "-",
//     },
//     {
//       key: "lastLoginAt",
//       label: "Last Login",
//       type: "date",
//       render: (value, row) => formatDate(row.lastLoginAt),
//     },
//     {
//       key: "status",
//       label: "Status",
//       type: "badge",
//     },
//     {
//       key: "createdAt",
//       label: "Created",
//       type: "date",
//       render: (value, row) => formatDate(row.createdAt),
//     },
//   ];

//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const validatePassword = (password) => {
//     return password.length >= 6;
//   };

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setIsSaving(true);

//     try {
//       const { data } = getSubmissionData();
//       console.log(data)

//       if (!roles.find((r) => String(r.roleId) === data.roleId)) {
//         throw new Error("Invalid role selected");
//       }

//       if (data.employeeId && data.employeeId !== "none" && !employees.find((e) => String(e.employeeId) === data.employeeId)) {
//         throw new Error("Invalid employee selected");
//       }

//       if (!validateEmail(data.email)) {
//         throw new Error("Invalid email format");
//       }

//       if (!editingAuth && !data.password) {
//         throw new Error("Password is required for new auth");
//       }

//       if (data.password && !validatePassword(data.password)) {
//         throw new Error("Password must be at least 6 characters");
//       }

//       if (!data.roleId) {
//         throw new Error("Role is required");
//       }

//       if (editingAuth && !data.password) {
//         delete data.password;
//       }

//       const result = editingAuth
//         ? await updateAuthRecord(editingAuth.authId, formData)
//         : await createAuthRecord(formData);

//       toast.success(editingAuth ? "Auth updated successfully" : "Auth created successfully");
//       setIsDialogOpen(false);
//       setEditingAuth(null);
//       resetForm();
//       await fetchAuths();
//     } catch (err) {
//       console.error("Auth operation error:", err);
//       toast.error(err.message || "An error occurred");
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   const handleEdit = (auth) => {
//     setFormData({
//       email: auth.email || "",
//       password: "",
//       roleId: auth.roleId ? String(auth.roleId) : (roles.length > 0 ? String(roles[0].roleId) : ""),
//       employeeId: auth.employeeId ? String(auth.employeeId) : "none",
//     });
//     setEditingAuth(auth);
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (authId) => {
//     if (!confirm("Are you sure you want to delete this auth record?")) return;

//     try {
//       const success = await deleteAuth(authId);
//       if (!success) {
//         throw new Error("Failed to delete auth record");
//       }
//       toast.success("Auth record deleted successfully");
//     } catch (error) {
//       toast.error(error.message || "Failed to delete auth record");
//     }
//   };

//   const handleRetry = () => {
//     fetchAuths();
//     fetchRoles();
//     fetchEmployees();
//   };

//   const handleDialogClose = (open) => {
//     setIsDialogOpen(open);
//     if (!open) {
//       setEditingAuth(null);
//       resetForm();
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">{t("Auth Management")}</h1>
//           <p className="text-muted-foreground">{t("Manage user authentication and roles")}</p>
//         </div>
//         <div className="flex gap-2">
//           {canCreate && (
//             <Button
//               variant="outline"
//               onClick={handleRetry}
//               disabled={authLoading || roleLoading || empLoading}
//             >
//               <RefreshCw
//                 className={`mr-2 h-4 w-4 ${authLoading || roleLoading || empLoading ? "animate-spin" : ""}`}
//               />
//               {t("Refresh")}
//             </Button>
//           )}
//           <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
//             <DialogTrigger asChild>
//               <Button disabled={roles.length === 0 || authLoading || roleLoading || !canCreate}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 {t("Add Auth")}
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[500px]">
//               <DialogHeader>
//                 <DialogTitle>{editingAuth ? "Edit Auth" : "Add New Auth"}</DialogTitle>
//                 <DialogDescription>
//                   {editingAuth ? "Update auth details" : "Create a new auth record"}
//                 </DialogDescription>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <FormInput
//                   name="email"
//                   disabled={isSaving}
//                   label={t("Email")}
//                   value={formData.email}
//                   placeholder={t("Email")}
//                   onCallbackInput={handleChange}
//                   required
//                   type="email"
//                 />
//                 <FormInput
//                   name="password"
//                   disabled={isSaving}
//                   label={editingAuth ? "New Password (optional)" : "Password"}
//                   value={formData.password}
//                   placeholder={editingAuth ? "Leave blank to keep current password" : "Password"}
//                   onCallbackInput={handleChange}
//                   required={!editingAuth}
//                   type="password"
//                 />
//                 <div className="grid grid-cols-2 gap-4">
//                   <Combobox
//                     name="roleId"
//                     label={t("Role")}
//                     options={roles.map((r) => ({
//                       value: String(r.roleId),
//                       label: r.name,
//                     }))}
//                     value={formData.roleId}
//                     onChange={(value) => handleChange({ target: { name: "roleId", value } })}
//                     disabled={isSaving || roles.length === 0}
//                     placeholder={roles.length === 0 ? "No roles available" : "Select role"}
//                     required
//                   />
//                   <Combobox
//                     name="employeeId"
//                     label={t("Employee")}
//                     options={[
//                       { value: "none", label: t("No Employee") },
//                       ...employees.map((e) => ({
//                         value: String(e.employeeId),
//                         label: e.employeeCode,
//                       })),
//                     ]}
//                     value={formData.employeeId}
//                     onChange={(value) => handleChange({ target: { name: "employeeId", value } })}
//                     disabled={isSaving || employees.length === 0}
//                     placeholder={employees.length === 0 ? "No employees available" : "Select employee"}
//                   />
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => handleDialogClose(false)}
//                     disabled={isSaving}
//                   >
//                     {t("Cancel")}
//                   </Button>
//                   <Button type="submit" disabled={isSaving || !canCreate}>
//                     {isSaving ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         {editingAuth ? "Updating..." : "Creating..."}
//                       </>
//                     ) : editingAuth ? (
//                       "Update Auth"
//                     ) : (
//                       "Create Auth"
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </motion.div>
//       {(authError || roleError || empError) && (
//         <Card className="border-destructive">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-destructive font-medium">{t("Error loading data")}</p>
//                 <p className="text-sm text-muted-foreground">{authError || roleError || empError}</p>
//               </div>
//               <Button
//                 variant="outline"
//                 onClick={handleRetry}
//                 disabled={authLoading || roleLoading || empLoading}
//               >
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
//                 <Lock className="h-5 w-5" />
//                 {t("Auth Directory")}
//                 {(authLoading || roleLoading || empLoading) && (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 )}
//               </CardTitle>
//               <CardDescription>{filteredAuths.length} active auth records</CardDescription>
//             </div>
//             <ViewToggle view={view} onViewChange={setView} />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search auth records..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//                 disabled={authLoading || roleLoading || empLoading}
//               />
//             </div>
//           </div>
//           {view === "card" ? (
//             <DataCards
//               data={filteredAuths}
//               fields={cardFields}
//               loading={authLoading || roleLoading || empLoading}
//               onEdit={canUpdate ? handleEdit : undefined}
//               onDelete={canDelete ? handleDelete : undefined}
//               idField="authId"
//               nameField="email"
//               columns={3}
//             />
//           ) : (
//             <DataTable
//               data={filteredAuths}
//               columns={tableColumns}
//               loading={authLoading || roleLoading || empLoading}
//               onEdit={canUpdate ? handleEdit : undefined}
//               onDelete={canDelete ? handleDelete : undefined}
//               idField="authId"
//               nameField="email"
//             />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

