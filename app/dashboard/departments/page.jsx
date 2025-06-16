"use client";

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
import { ViewToggle } from "@/components/ui/view-toggle";
import { DataTable } from "@/components/ui/data-table";
import { DataCards } from "@/components/ui/data-cards";
import { Plus, Search, Building, Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFormHandler } from "@/hooks/use-form";
import { useDepartmentStore } from "@/stores/department-store";
import { createDepartment, updateDepartment } from "@/app/actions/departments";
import { FormInput, FormTextArea } from "@/components/form";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "sonner";

export default function DepartmentsPage() {
  const { t } = useTranslation("common");
  const { canCreate } = usePermissions();
  const {
    items: departments,
    isLoading,
    error,
    fetch,
    delete: deleteDepartment,
  } = useDepartmentStore();

  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState("table");
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [localDepartments, setLocalDepartments] = useState(departments);

  const { formData, resetForm, setFormData, handleChange, getSubmissionData } = useFormHandler({
    departmentName: "",
    departmentCode: "",
    memo: "",
    status: "active",
  });

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    setLocalDepartments(departments);
  }, [departments]);

  const activeDepartments = localDepartments.filter((dept) => dept.status === "active");

  const filteredDepartments = activeDepartments.filter(
    (department) =>
      department.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (department.departmentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
  );

  const tableColumns = [
    {
      key: "departmentName",
      label: t("Department Name"),
    },
    {
      key: "departmentCode",
      label: t("Department Code"),
      render: (_value, row) => row.departmentCode ?? "-",
    },
    {
      key: "_count.employees",
      label: t("Employees"),
      type: "badge",
      render: (value, row) => row.Employee?.length || 0,
    },
    {
      key: "_count.positions",
      label: t("Positions"),
      type: "badge",
      render: (value, row) => row.Position?.length || 0,
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
  ];

  const cardFields = [
    {
      key: "departmentName",
      primary: true,
    },
    {
      key: "departmentCode",
      secondary: true,
      render: (_value, row) => row.departmentCode ?? "-",
    },
    {
      key: "_count.employees",
      label: t("Employees"),
      type: "badge",
      render: (value, row) => row.Employee?.length || 0,
    },
    {
      key: "_count.positions",
      label: t("Positions"),
      type: "badge",
      render: (value, row) => row.Position?.length || 0,
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
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data } = getSubmissionData();

      const result = editingDepartment
        ? await updateDepartment(editingDepartment.departmentId, data)
        : await createDepartment(data);

      if (!result.success) {
        throw new Error(result.error || t("Department operation failed"));
      }

      toast.success(editingDepartment ? t("Department updated successfully") : t("Department created successfully"));

      setIsDialogOpen(false);
      setEditingDepartment(null);
      resetForm();

      await fetch();
    } catch (err) {
      console.error("Department operation error:", err);
      toast.error(err.message || t("An error occurred"));
    } finally {
      setIsSaving(false);
    }
  }

  const handleEdit = (department) => {
    setFormData({
      departmentName: department.departmentName || "",
      departmentCode: department.departmentCode || "",
      memo: department.memo || "",
      status: department.status || "active",
    });
    setEditingDepartment(department);
    setIsDialogOpen(true);
  };

  const handleDelete = async (departmentId) => {
    if (!confirm(t("Are you sure you want to delete this department?"))) return;

    const success = await deleteDepartment(departmentId);
    if (success) {
      setLocalDepartments((prev) => prev.filter((dept) => dept.departmentId !== departmentId));
      toast.success(t("Department deleted successfully"));
    } else {
      toast.error(t("Failed to delete department"));
    }
  };

  const handleRetry = () => {
    fetch();
  };

  const handleDialogClose = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingDepartment(null);
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
          <h1 className="text-3xl font-bold tracking-tight">{t("Departments")}</h1>
          <p className="text-muted-foreground">{t("Manage organizational departments and structure")}</p>
        </div>

        <div className="flex gap-2">
          {canCreate && (
            <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("Refresh")}
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button disabled={isLoading || !canCreate}>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Department")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingDepartment ? t("Edit Department") : t("Add New Department")}</DialogTitle>
                <DialogDescription>
                  {editingDepartment ? t("Update department information") : t("Create a new department")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  name="departmentName"
                  disabled={isSaving}
                  label={t("Department Name")}
                  value={formData.departmentName}
                  placeholder={t("Department Name")}
                  onCallbackInput={handleChange}
                  required
                />
                <FormInput
                  name="departmentCode"
                  disabled={isSaving}
                  label={t("Department Code")}
                  value={formData.departmentCode}
                  placeholder={t("Department Code")}
                  onCallbackInput={handleChange}
                />
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
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="active">{t("Active")}</option>
                    <option value="inactive">{t("Inactive")}</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSaving}>
                    {t("Cancel")}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingDepartment ? t("Updating...") : t("Creating...")}
                      </>
                    ) : editingDepartment ? (
                      t("Update Department")
                    ) : (
                      t("Create Department")
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
                <p className="text-destructive font-medium">{t("Error loading data")}</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
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
                <Building className="h-5 w-5" />
                {t("Organization Departments")}
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredDepartments.length} {t("active departments")}</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search departments...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
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
  );
}


// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { ViewToggle } from "@/components/ui/view-toggle";
// import { DataTable } from "@/components/ui/data-table";
// import { DataCards } from "@/components/ui/data-cards";
// import { Plus, Search, Building, Loader2, RefreshCw } from "lucide-react";

// import { useDepartmentStore } from "@/stores/department-store";
// import { createDepartment, updateDepartment } from "@/app/actions/departments";

// export default function DepartmentsPage() {
//   const {
//     items: departments,
//     isLoading,
//     error,
//     fetch,
//     delete: deleteDepartment,
//   } = useDepartmentStore();

//   const [isSaving, setIsSaving] = useState(false);
//   const [saveError, setSaveError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [view, setView] = useState("table");
//   const [editingDepartment, setEditingDepartment] = useState(null);
//   const [localDepartments, setLocalDepartments] = useState(departments);

//   useEffect(() => {
//     fetch();
//   }, [fetch]);

//   useEffect(() => {
//     setLocalDepartments(departments);
//   }, [departments]);

//   const activeDepartments = localDepartments.filter((dept) => dept.status === "active");

//   const filteredDepartments = activeDepartments.filter(
//     (department) =>
//       department.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (department.departmentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
//   );

//   const tableColumns = [
//     {
//       key: "departmentName",
//       label: "Department Name",
//     },
//     {
//       key: "departmentCode",
//       label: "Department Code",
//     },
//     {
//       key: "_count.employees",
//       label: "Employees",
//       type: "badge",
//       render: (value, row) => row.Employee?.length || 0,
//     },
//     {
//       key: "_count.positions",
//       label: "Positions",
//       type: "badge",
//       render: (value, row) => row.Position?.length || 0,
//     },
//     {
//       key: "memo",
//       label: "Description",
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
//     },
//   ];

//   const cardFields = [
//     {
//       key: "departmentName",
//       primary: true,
//     },
//     {
//       key: "departmentCode",
//       secondary: true,
//     },
//     {
//       key: "_count.employees",
//       label: "Employees",
//       type: "badge",
//       render: (value, row) => row.Employee?.length || 0,
//     },
//     {
//       key: "_count.positions",
//       label: "Positions",
//       type: "badge",
//       render: (value, row) => row.Position?.length || 0,
//     },
//     {
//       key: "memo",
//       label: "Description",
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
//     },
//   ];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     if (editingDepartment) {
//       formData.append("departmentId", editingDepartment.departmentId);
//     }

//     setIsSaving(true);
//     setSaveError(null);
//     try {
//       const result = editingDepartment
//         ? await updateDepartment(formData)
//         : await createDepartment(formData);

//       if (result.success) {
//         if (editingDepartment) {
//           setLocalDepartments((prev) =>
//             prev.map((dept) =>
//               dept.departmentId === result.department.departmentId ? result.department : dept
//             )
//           );
//         } else {
//           setLocalDepartments((prev) => [...prev, result.department]);
//         }
//         setIsDialogOpen(false);
//         setEditingDepartment(null);
//         e.target.reset();
//       } else {
//         // Handle Zod errors or other errors
//         if (Array.isArray(result.error)) {
//           // Zod validation errors
//           setSaveError(result.error.map((err) => err.message).join(", "));
//         } else {
//           setSaveError(result.error || "Department operation failed");
//         }
//       }
//     } catch (error) {
//       setSaveError(error.message || "An unexpected error occurred");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleEdit = (department) => {
//     setEditingDepartment(department);
//     setIsDialogOpen(true);
//     setSaveError(null);
//   };

//   const handleDelete = async (departmentId) => {
//     if (!confirm("Are you sure you want to delete this department?")) return;

//     const success = await deleteDepartment(departmentId);
//     if (success) {
//       setLocalDepartments((prev) => prev.filter((dept) => dept.departmentId !== departmentId));
//     }
//   };

//   const handleRetry = () => {
//     fetch();
//   };

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
//           <p className="text-muted-foreground">Manage organizational departments and structure</p>
//         </div>

//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
//             <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
//             Refresh
//           </Button>

//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open);
//               if (!open) {
//                 setEditingDepartment(null);
//                 setSaveError(null);
//               }
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button>
//                 <Plus className="mr-2 h-4 w-4" />
//                 Add Department
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[500px]">
//               <DialogHeader>
//                 <DialogTitle>{editingDepartment ? "Edit Department" : "Add New Department"}</DialogTitle>
//                 <DialogDescription>
//                   {editingDepartment ? "Update department information" : "Create a new department"}
//                 </DialogDescription>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="departmentName">Department Name *</Label>
//                   <Input
//                     id="departmentName"
//                     name="departmentName"
//                     required
//                     defaultValue={editingDepartment?.departmentName || ""}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="departmentCode">Department Code</Label>
//                   <Input
//                     id="departmentCode"
//                     name="departmentCode"
//                     defaultValue={editingDepartment?.departmentCode || ""}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="memo">Description</Label>
//                   <Textarea id="memo" name="memo" rows={3} defaultValue={editingDepartment?.memo || ""} />
//                 </div>
//                 {saveError && (
//                   <p className="text-destructive text-sm">{saveError}</p>
//                 )}
//                 <div className="flex justify-end gap-2">
//                   <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button type="submit" disabled={isSaving}>
//                     {isSaving ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         {editingDepartment ? "Updating..." : "Creating..."}
//                       </>
//                     ) : editingDepartment ? (
//                       "Update Department"
//                     ) : (
//                       "Create Department"
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </motion.div>

//       {error && (
//         <Card className="border-destructive">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-destructive font-medium">Error loading data</p>
//                 <p className="text-sm text-muted-foreground">{error}</p>
//               </div>
//               <Button variant="outline" onClick={handleRetry}>
//                 Try Again
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
//                 <Building className="h-5 w-5" />
//                 Organization Departments
//                 {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
//               </CardTitle>
//               <CardDescription>{filteredDepartments.length} departments in your organization</CardDescription>
//             </div>
//             <ViewToggle view={view} onViewChange={setView} />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search departments..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           {view === "card" ? (
//             <DataCards
//               data={filteredDepartments}
//               fields={cardFields}
//               loading={isLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="departmentId"
//               nameField="departmentName"
//               columns={3}
//             />
//           ) : (
//             <DataTable
//               data={filteredDepartments}
//               columns={tableColumns}
//               loading={isLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="departmentId"
//               nameField="departmentName"
//             />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
