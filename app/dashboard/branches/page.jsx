"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
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
import { ViewToggle } from "@/components/ui/view-toggle";
import { DataTable } from "@/components/ui/data-table";
import { DataCards } from "@/components/ui/data-cards";
import { Plus, Search, Building2, Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBranchStore } from "@/stores/branch-store";
import { usePermissions } from "@/hooks/use-permissions";
import { useFormHandler } from "@/hooks/use-form";
import { FormInput, FormTextArea, FormImageResize, FormImagePreview } from "@/components/form";
import { toast } from "sonner";
import { createBranch, updateBranch, deleteBranch } from "@/app/actions/branches";

export default function BranchesPage() {
  const { t } = useTranslation("common");
  const {
    items: branches,
    isLoading: branchLoading,
    error: branchError,
    fetch: fetchBranches,
  } = useBranchStore();

  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("table");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [error, setError] = useState(null);

  const { formData, resetForm, setFormData, handleChange, handleImageData, getSubmissionData } = useFormHandler({
    branchName: "",
    tel: "",
    memo: "",
    picture: null,
  });

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const activeBranches = branches.filter((branch) => branch.status === "active");

  const filteredBranches = activeBranches.filter(
    (branch) =>
      branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.branchCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableColumns = [
    { key: "branchName", label: t("Branch"), type: "image" },
    { key: "branchCode", label: t("Code"), render: (_value, row) => row.branchCode ?? "-" },
    { key: "tel", label: t("Phone"), render: (_value, row) => row.tel ?? "-" },
    { key: "memo", label: t("Memo"), render: (_value, row) => row.memo ?? "-" },
    { key: "createdAt", label: t("Created"), type: "date" },
    { key: "status", label: t("Status"), type: "badge" },
  ];

  const cardFields = [
    { key: "picture", type: "image" },
    { key: "branchName", primary: true },
    { key: "branchCode", secondary: true, render: (_value, row) => row.branchCode ?? "-" },
    { key: "tel", label: t("Phone"), render: (_value, row) => row.tel ?? "-" },
    { key: "memo", label: t("Memo"), render: (_value, row) => row.memo ?? "-" },
    { key: "status", label: t("Status"), type: "badge" },
    { key: "createdAt", label: t("Created"), type: "date" },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    console.log(editingBranch.branchId)

    try {
      const { data, file } = getSubmissionData();

      console.log("Submitting:", { data, file: file?.name });

      const result = editingBranch
        ? await updateBranch(editingBranch.branchId, data, file)
        : await createBranch(data, file);

      if (!result.success) {
        throw new Error(result.error || t("Branch operation failed"));
      }

      toast.success(editingBranch ? t("Branch updated successfully") : t("Branch created successfully"));

      setIsDialogOpen(false);
      setEditingBranch(null);
      resetForm();
      await fetchBranches();
    } catch (err) {
      console.error("Submission error:", err);
      setError(err);
      toast.error(err.message || t("An error occurred"));
    } finally {
      setIsSaving(false);
    }
  }

  const handleEdit = (branch) => {
    if (!canUpdate) return;
    setEditingBranch(branch);
    setFormData({
      branchName: branch.branchName || "",
      tel: branch.tel || "",
      memo: branch.memo || "",
      picture: branch.picture || null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (branchId) => {
    if (!canDelete) return;
    if (!confirm(t("Are you sure you want to delete this branch?"))) return;

    try {
      const result = await deleteBranch(branchId);
      if (result.success) {
        toast.success(t("Branch deleted successfully"));
        await fetchBranches();
      } else {
        throw new Error(result.error || t("Failed to delete branch"));
      }
    } catch (error) {
      console.error("Deletion error:", error);
      setError(error);
      toast.error(error.message || t("Failed to delete branch"));
    }
  };

  const handleRetry = () => {
    fetchBranches();
  };

  const handleDialogClose = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingBranch(null);
      resetForm();
    }
  };

  return (
    <Layout pageTitle="Branches">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          {error && (
            <div className="text-destructive p-2 rounded bg-destructive/10">
              {error.message || String(error)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("Branches")}</h1>
            <p className="text-muted-foreground">{t("Manage your branch network")}</p>
          </div>

          <div className="flex gap-2">
            {canCreate && (
              <Button variant="outline" onClick={handleRetry} disabled={branchLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${branchLoading ? "animate-spin" : ""}`} />
                {t("Refresh")}
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                {canCreate && (
                  <Button disabled={branchLoading}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("Add Branch")}
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingBranch ? t("Edit Branch") : t("Add New Branch")}</DialogTitle>
                  <DialogDescription>
                    {editingBranch ? t("Update branch details") : t("Create a new branch in your network")}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <FormInput
                      name="branchName"
                      disabled={isSaving}
                      label={t("Branch Name")}
                      value={formData.branchName}
                      placeholder={t("Branch Name")}
                      onCallbackInput={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <FormInput
                      name="tel"
                      type="tel"
                      disabled={isSaving}
                      label={t("Phone Number")}
                      value={formData.tel}
                      placeholder={t("Phone Number")}
                      onCallbackInput={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormTextArea
                      rows={4}
                      name="memo"
                      label={t("Memo")}
                      disabled={isSaving}
                      value={formData.memo}
                      placeholder={t("Memo")}
                      onCallbackInput={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormImageResize onCallbackData={handleImageData} />
                    {formData.picture && (
                      <FormImagePreview
                        imgSrc={
                          formData.picture instanceof File ? URL.createObjectURL(formData.picture) : formData.picture
                        }
                        height={200}
                      />
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSaving}>
                      {t("Cancel")}
                    </Button>
                    {(canCreate || canUpdate) && (
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingBranch ? t("Updating...") : t("Creating...")}
                          </>
                        ) : editingBranch ? (
                          t("Update Branch")
                        ) : (
                          t("Create Branch")
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {(branchError || branchLoading) && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-destructive font-medium">{t("Error loading data")}</p>
                  <p className="text-sm text-muted-foreground">{branchError?.message || t("Loading branches")}</p>
                </div>
                <Button variant="outline" onClick={handleRetry} disabled={branchLoading}>
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
                  <Building2 className="h-5 w-5" />
                  {t("Branch Network")}
                  {branchLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
                <CardDescription>{filteredBranches.length} {t("active branches")}</CardDescription>
              </div>
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  placeholder={t("Search branches...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={branchLoading}
                />
              </div>
            </div>

            {view === "card" ? (
              <DataCards
                data={filteredBranches}
                fields={cardFields}
                loading={branchLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                idField="branchId"
                imageField="picture"
                nameField="branchName"
                columns={4}
              />
            ) : (
              <DataTable
                data={filteredBranches}
                columns={tableColumns}
                loading={branchLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                idField="branchId"
                imageField="picture"
                nameField="branchName"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
