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
import { Combobox } from "@/components/ui/combobox";
import { ViewToggle } from "@/components/ui/view-toggle";
import { DataTable } from "@/components/ui/data-table";
import { DataCards } from "@/components/ui/data-cards";
import { Plus, Search, Package, Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProductStore, useCategoryStore, useBrandStore } from "@/stores";
import { usePermissions } from "@/hooks/use-permissions";
import { useFormHandler } from "@/hooks/use-form";
import { unit } from "@/constant";
import { createProduct, updateProduct, deleteProduct } from "@/app/actions/products";
import { FormInput, FormTextArea, FormImageResize, FormImagePreview } from "@/components/form";
import { toast } from "sonner";

export default function ProductsPage() {
  const { t } = useTranslation("common");
  const {
    items: products,
    isLoading: prodLoading,
    error: prodError,
    fetch: prodFetch,
  } = useProductStore();
  const {
    items: categories,
    isLoading: cateLoading,
    error: cateError,
    fetch: cateFetch,
  } = useCategoryStore();
  const {
    items: brands,
    isLoading: brandLoading,
    fetch: brandFetch,
  } = useBrandStore();

  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("table");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState(null);

  const { formData, resetForm, setFormData, handleChange, handleImageData, getSubmissionData } = useFormHandler({
    productName: "",
    productCode: "",
    unit: "",
    capacity: "",
    sellPrice: "",
    costPrice: "",
    discountRate: "",
    desc: "",
    categoryId: "",
    brandId: "",
    picture: null,
  });

  useEffect(() => {
    prodFetch();
    cateFetch();
    brandFetch();
  }, [prodFetch, cateFetch, brandFetch]);

  const activeCategories = categories.filter((cate) => cate.status === "active");
  const activeBrands = brands.filter((brand) => brand.status === "active");
  const activeProducts = products.filter((prod) => prod.status === "active");

  const filteredProducts = activeProducts.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableColumns = [
    { key: "productName", label: t("Product"), type: "image" },
    {
      key: "Category.categoryName",
      label: t("Category"),
      render: (_value, row) => row.Category?.categoryName ?? t("Unknown"),
    },
    {
      key: "unit_capacity",
      label: t("Unit/Capacity"),
      render: (_value, row) =>
        row.unit && row.capacity != null ? `${row.capacity} ${row.unit}` : row.unit || row.capacity || "-",
    },
    { key: "costPrice", label: t("Cost Price"), type: "currency" },
    { key: "sellPrice", label: t("Sell Price"), type: "currency" },
    {
      key: "Stock.quantity",
      label: t("Stock"),
      type: "badge",
      render: (_value, row) => row.Stock?.reduce((sum, stock) => sum + stock.quantity, 0) ?? 0,
    },
    { key: "status", label: t("Status"), type: "badge" },
  ];

  const cardFields = [
    { key: "picture", type: "image" },
    { key: "productName", primary: true },
    { key: "productCode", secondary: true },
    {
      key: "Category.categoryName",
      label: t("Category"),
      render: (_value, row) => row.Category?.categoryName ?? t("Unknown"),
    },
    { key: "costPrice", label: t("Cost"), type: "currency" },
    { key: "sellPrice", label: t("Price"), type: "currency" },
    {
      key: "Stock.quantity",
      label: t("Stock"),
      type: "badge",
      render: (_value, row) => row.Stock?.reduce((sum, stock) => sum + stock.quantity, 0) ?? 0,
    },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const { data, file } = getSubmissionData();

      console.log("Submitting:", { data, file: file?.name });

      const result = editingProduct
        ? await updateProduct(editingProduct.productId, data, file)
        : await createProduct(data, file);

      if (!result.success) {
        throw new Error(result.error || t("Product operation failed"));
      }

      toast.success(editingProduct ? t("Product updated successfully") : t("Product created successfully"));

      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      await prodFetch();
    } catch (err) {
      console.error("Submission error:", err);
      setError(err);
      toast.error(err.message || t("An error occurred"));
    } finally {
      setIsSaving(false);
    }
  }

  const handleEdit = (product) => {
    if (!canUpdate) return;
    setEditingProduct(product);
    setFormData({
      productName: product.productName || "",
      productCode: product.productCode || "",
      unit: product.unit || "",
      capacity: product.capacity?.toString() || "",
      sellPrice: product.sellPrice?.toString() || "",
      costPrice: product.costPrice?.toString() || "",
      discountRate: product.discountRate?.toString() || "",
      desc: product.desc || "",
      categoryId: product.categoryId?.toString() || "",
      brandId: product.brandId?.toString() || "",
      picture: product.picture || null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!canDelete) return;
    if (!confirm(t("Are you sure you want to delete this product?"))) return;

    try {
      const result = await deleteProduct(productId);
      if (result.success) {
        toast.success(t("Product deleted successfully"));
        await prodFetch();
      } else {
        throw new Error(result.error || t("Failed to delete product"));
      }
    } catch (error) {
      console.error("Deletion error:", error);
      setError(error);
      toast.error(error.message || t("Failed to delete product"));
    }
  };

  const handleRetry = () => {
    prodFetch();
    cateFetch();
    brandFetch();
  };

  const handleDialogClose = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingProduct(null);
      resetForm();
    }
  };

  return (
    <Layout pageTitle="Products">
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
            <h1 className="text-3xl font-bold tracking-tight">{t("Products")}</h1>
            <p className="text-muted-foreground">{t("Manage your fertilizer inventory and product catalog")}</p>
          </div>

          <div className="flex gap-2">
            {canCreate && (
              <Button variant="outline" onClick={handleRetry} disabled={prodLoading || cateLoading || brandLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${prodLoading || cateLoading || brandLoading ? "animate-spin" : ""}`} />
                {t("Refresh")}
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button disabled={activeCategories.length === 0 || prodLoading || cateLoading || brandLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("Add Product")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? t("Edit Product") : t("Add New Product")}</DialogTitle>
                  <DialogDescription>
                    {editingProduct ? t("Update product information") : t("Create a new product in your inventory")}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FormInput
                        name="productName"
                        disabled={isSaving}
                        label={t("Product Name")}
                        value={formData.productName}
                        placeholder={t("Product Name")}
                        onCallbackInput={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <FormInput
                        name="sellPrice"
                        type="number"
                        step="0.01"
                        disabled={isSaving}
                        label={t("Sell Price")}
                        value={formData.sellPrice}
                        placeholder={t("Sell Price")}
                        onCallbackInput={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryId">{t("Category")} *</Label>
                      <Combobox
                        id="categoryId"
                        name="categoryId"
                        options={activeCategories.map((category) => ({
                          value: category.categoryId.toString(),
                          label: category.categoryName,
                        }))}
                        placeholder={t("Select category...")}
                        value={formData.categoryId}
                        onChange={(value) => handleChange("categoryId", value)}
                        disabled={isSaving}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brandId">{t("Brand")}</Label>
                      <Combobox
                        id="brandId"
                        name="brandId"
                        options={[
                          { value: "", label: t("No brand") },
                          ...activeBrands.map((brand) => ({
                            value: brand.brandId.toString(),
                            label: brand.brandName,
                          })),
                        ]}
                        placeholder={t("Select brand...")}
                        value={formData.brandId}
                        onChange={(value) => handleChange("brandId", value)}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FormInput
                        name="costPrice"
                        type="number"
                        step="0.01"
                        disabled={isSaving}
                        label={t("Cost Price")}
                        value={formData.costPrice}
                        placeholder={t("Cost Price")}
                        onCallbackInput={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <FormInput
                        name="discountRate"
                        type="number"
                        min="0"
                        max="100"
                        disabled={isSaving}
                        label={t("Discount %")}
                        value={formData.discountRate}
                        placeholder={t("Discount %")}
                        onCallbackInput={handleChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FormInput
                        name="capacity"
                        type="number"
                        step="0.01"
                        disabled={isSaving}
                        label={t("Capacity")}
                        value={formData.capacity}
                        placeholder={t("Capacity")}
                        onCallbackInput={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">{t("Unit")}</Label>
                      <Combobox
                        id="unit"
                        name="unit"
                        options={unit.map((u) => ({ value: u.value, label: u.label }))}
                        placeholder={t("Select unit...")}
                        value={formData.unit}
                        onChange={(value) => handleChange("unit", value)}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FormTextArea
                      rows={3}
                      name="desc"
                      label={t("Description")}
                      disabled={isSaving}
                      value={formData.desc}
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
                            {editingProduct ? t("Updating...") : t("Creating...")}
                          </>
                        ) : editingProduct ? (
                          t("Update Product")
                        ) : (
                          t("Create Product")
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {(prodError || prodLoading) && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-destructive font-medium">{t("Error loading data")}</p>
                  <p className="text-sm text-muted-foreground">{prodError?.message || t("Loading products")}</p>
                </div>
                <Button variant="outline" onClick={handleRetry} disabled={prodLoading || cateLoading || brandLoading}>
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
                  <Package className="h-5 w-5" />
                  {t("Product Inventory")}
                  {(prodLoading || cateLoading || brandLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
                <CardDescription>{filteredProducts.length} {t("products in your catalog")}</CardDescription>
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
                  placeholder={t("Search products...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={prodLoading || cateLoading || brandLoading}
                />
              </div>
            </div>

            {view === "card" ? (
              <DataCards
                data={filteredProducts}
                fields={cardFields}
                loading={prodLoading || cateLoading || brandLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                idField="productId"
                imageField="picture"
                nameField="productName"
                columns={4}
              />
            ) : (
              <DataTable
                data={filteredProducts}
                columns={tableColumns}
                loading={prodLoading || cateLoading || brandLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                idField="productId"
                imageField="picture"
                nameField="productName"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


