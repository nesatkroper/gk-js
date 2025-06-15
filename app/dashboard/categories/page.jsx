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
import { Plus, Search, FolderOpen, Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCategoryStore } from "@/stores/category-store";
import { usePermissions } from "@/hooks/use-permissions";
import { useFormHandler } from "@/hooks/use-form";
import { createCategory, updateCategory } from "@/app/actions/categories";
import { FormInput, FormTextArea, FormImageResize, FormImagePreview } from "@/components/form";
import { toast } from "sonner";

export default function CategoriesPage() {
  const { t } = useTranslation("common");
  const { items: categories, isLoading, error, fetch, delete: deleteCategory } = useCategoryStore();
  const { canCreate } = usePermissions();
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("table");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { formData, resetForm, setFormData, handleChange, handleImageData, getSubmissionData } = useFormHandler({
    categoryName: "",
    categoryCode: "",
    memo: "",
    picture: null,
  });

  useEffect(() => {
    fetch();
  }, [fetch]);

  const activeCategories = categories.filter((cat) => cat.status === "active");

  const filteredCategories = activeCategories.filter(
    (category) =>
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.categoryCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableColumns = [
    { key: "categoryName", label: t("Category Name"), type: "image" },
    { key: "categoryCode", label: t("Category Code"), render: (_value, row) => row.categoryCode ?? "-" },
    { key: "memo", label: t("Description"), render: (_value, row) => row.memo ?? "-" },
    { key: "status", label: t("Status"), type: "badge" },
    { key: "createdAt", label: t("Created"), type: "date" },
  ];

  const cardFields = [
    { key: "picture", type: "image" },
    { key: "categoryName", primary: true },
    { key: "categoryCode", secondary: true, render: (_value, row) => row.categoryCode ?? "-" },
    { key: "memo", label: t("Description"), render: (_value, row) => row.memo ?? "-" },
    { key: "status", label: t("Status"), type: "badge" },
    { key: "createdAt", label: t("Created"), type: "date" },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data, file } = getSubmissionData();

      console.log("Submitting:", { data, file: file?.name });

      const result = editingCategory
        ? await updateCategory(editingCategory.categoryId, data, file)
        : await createCategory(data, file);

      if (!result.success) {
        throw new Error(result.error || t("Category operation failed"));
      }

      toast.success(editingCategory ? t("Category updated successfully") : t("Category created successfully"));

      setIsDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      await fetch();
    } catch (err) {
      console.error("Category operation error:", err);
      toast.error(err.message || t("An error occurred"));
    } finally {
      setIsSaving(false);
    }
  }

  const handleEdit = (category) => {
    setFormData({
      categoryName: category.categoryName || "",
      categoryCode: category.categoryCode || "",
      memo: category.memo || "",
      picture: category.picture || null,
    });
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm(t("Are you sure you want to delete this category?"))) return;

    const success = await deleteCategory(categoryId);
    if (success) {
      toast.success(t("Category deleted successfully"));
      await fetch();
    } else {
      toast.error(t("Failed to delete category"));
    }
  };

  const handleRetry = () => {
    fetch();
  };

  const handleDialogClose = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCategory(null);
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
          <h1 className="text-3xl font-bold tracking-tight">{t("Categories")}</h1>
          <p className="text-muted-foreground">{t("Organize your products with categories")}</p>
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
              <Button disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Category")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingCategory ? t("Edit Category") : t("Add New Category")}</DialogTitle>
                <DialogDescription>
                  {editingCategory ? t("Update category details") : t("Create a new category for your products")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  name="categoryName"
                  disabled={isSaving}
                  label={t("Category Name")}
                  value={formData.categoryName}
                  placeholder={t("Category Name")}
                  onCallbackInput={handleChange}
                  required
                />

                <FormTextArea
                  rows={4}
                  name="memo"
                  label={t("Description")}
                  disabled={isSaving}
                  value={formData.memo}
                  onCallbackInput={handleChange}
                />

                <FormImageResize onCallbackData={handleImageData} />

                {formData.picture && (
                  <FormImagePreview
                    imgSrc={
                      formData.picture instanceof File ? URL.createObjectURL(formData.picture) : formData.picture
                    }
                    height={200}
                  />
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSaving}>
                    {t("Cancel")}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingCategory ? t("Updating...") : t("Creating...")}
                      </>
                    ) : editingCategory ? (
                      t("Update Category")
                    ) : (
                      t("Create Category")
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
                <FolderOpen className="h-5 w-5" />
                {t("Categories")}
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredCategories.length} {t("categories available")}</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search categories...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredCategories}
              fields={cardFields}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="categoryId"
              imageField="picture"
              nameField="categoryName"
              columns={3}
            />
          ) : (
            <DataTable
              data={filteredCategories}
              columns={tableColumns}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="categoryId"
              imageField="picture"
              nameField="categoryName"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}




// "use client";

// import React, { useState, useEffect } from "react";
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
// import { Plus, Search, FolderOpen, Loader2, RefreshCw } from "lucide-react";
// import { useCategoryStore } from "@/stores/category-store";
// import { t } from "i18next";
// import { createCategory, updateCategory } from "@/app/actions/categories"; // Import Server Actions
// import { useRouter } from "next/navigation";
// import { FileUpload } from "@/components/ui/file-upload";

// export default function CategoriesPage() {
//   const { items: categories, isLoading, error, fetch, delete: deleteCategory } = useCategoryStore();
//   const router = useRouter();
//   const [isSaving, setIsSaving] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [view, setView] = useState("table");
//   const [editingCategory, setEditingCategory] = useState(null);

//   useEffect(() => {
//     fetch();
//   }, [fetch]);

//   const activeCategories = categories.filter((cat) => cat.status === "active");

//   const filteredCategories = activeCategories.filter(
//     (category) =>
//       category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       category.categoryCode?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const tableColumns = [
//     { key: "categoryName", label: "Category Name", type: "image" },
//     { key: "categoryCode", label: "Category Code" },
//     { key: "memo", label: "Description" },
//     { key: "status", label: "Status", type: "badge" },
//     { key: "createdAt", label: "Created", type: "date" },
//   ];

//   const cardFields = [
//     { key: "picture", type: "image" },
//     { key: "categoryName", primary: true },
//     { key: "categoryCode", secondary: true },
//     { key: "memo", label: "Description" },
//     { key: "status", label: "Status", type: "badge" },
//     { key: "createdAt", label: "Created", type: "date" },
//   ];

//   async function handleSubmit(formData) {
//     setIsSaving(true);

//     const categoryData = {
//       categoryName: formData.get("categoryName"),
//       categoryCode: formData.get("categoryCode"),
//       memo: formData.get("memo"),
//       picture: editingCategory?.picture || null,
//     };

//     const result = editingCategory
//       ? await updateCategory(editingCategory.categoryId, categoryData)
//       : await createCategory(categoryData);

//     setIsSaving(false);

//     if (result.success) {

//       setIsDialogOpen(false);
//       setEditingCategory(null);
//       router.refresh();
//     } else {
//       console.log(error)
//     }
//   }

//   const handleEdit = (category) => {
//     setEditingCategory(category);
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (categoryId) => {
//     if (!confirm("Are you sure you want to delete this category?")) return;

//     const success = await deleteCategory(categoryId);
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
//           <h1 className="text-3xl font-bold tracking-tight">{t("Categories")}</h1>
//           <p className="text-muted-foreground">{t("Organize your products with categories")}</p>
//         </div>

//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
//             <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
//             {t("Refresh")}
//           </Button>

//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open);
//               if (!open) setEditingCategory(null);
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button>
//                 <Plus className="mr-2 h-4 w-4" />
//                 {t("Add Category")}
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[500px]">
//               <DialogHeader>
//                 <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
//                 <DialogDescription>
//                   {editingCategory ? "Update category information" : "Create a new category for your products"}
//                 </DialogDescription>
//               </DialogHeader>
//               <form action={handleSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="categoryName">{t("Category Name")} *</Label>
//                   <Input
//                     id="categoryName"
//                     name="categoryName"
//                     required
//                     defaultValue={editingCategory?.categoryName || ""}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="memo">{t("Description")}</Label>
//                   <Textarea
//                     id="memo"
//                     name="memo"
//                     rows={3}
//                     defaultValue={editingCategory?.memo || ""}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>{t("Brand Image")}</Label>
//                   <FileUpload
//                     onFileSelect={(file) => setSelectedFile(file)}
//                     accept="image/*"
//                     maxSize={5}
//                     preview={true}
//                     value={selectedFile}
//                     placeholder="Upload category image"
//                     disabled={isSaving}
//                   />
//                 </div>

//                 <div className="flex justify-end gap-2">
//                   <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                     {t("Cancel")}
//                   </Button>
//                   <Button type="submit" disabled={isSaving}>
//                     {isSaving ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         {editingCategory ? "Updating..." : "Creating..."}
//                       </>
//                     ) : editingCategory ? (
//                       "Update Category"
//                     ) : (
//                       "Create Category"
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
//                 <p className="text-destructive font-medium">{t("Error loading data")}</p>
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
//                 <FolderOpen className="h-5 w-5" />
//                 {t("Categories")}
//                 {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
//               </CardTitle>
//               <CardDescription>{filteredCategories.length} categories available</CardDescription>
//             </div>
//             <ViewToggle view={view} onViewChange={setView} />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search categories..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           {view === "card" ? (
//             <DataCards
//               data={filteredCategories}
//               fields={cardFields}
//               loading={isLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="categoryId"
//               nameField="categoryName"
//               columns={3}
//               imageField="picture"
//             />
//           ) : (
//             <DataTable
//               data={filteredCategories}
//               columns={tableColumns}
//               loading={isLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="categoryId"
//               nameField="categoryName"
//               imageField="picture"
//             />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

