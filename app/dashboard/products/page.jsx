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
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { FileUpload } from "@/components/ui/file-upload";
import { ViewToggle } from "@/components/ui/view-toggle";
import { DataTable } from "@/components/ui/data-table";
import { DataCards } from "@/components/ui/data-cards";
import { Plus, Search, Package, Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { validateFile } from "@/lib/file-upload";
import { useProductStore, useCategoryStore, useBrandStore } from "@/stores";
import { usePermissions } from "@/hooks/use-permissions";
import { unit } from "@/constant";

export default function ProductsPage() {
  const { t } = useTranslation("common");
  const {
    items: products,
    isLoading: prodLoading,
    error: prodError,
    fetch: prodFetch,
    delete: prodDelete,
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
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("table");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  useEffect(() => {
    prodFetch();
    cateFetch();
    brandFetch();
  }, [prodFetch, cateFetch, brandFetch]);

  useEffect(() => {
    if (editingProduct) {
      setSelectedCategoryId(editingProduct.categoryId?.toString() || "");
      setSelectedBrandId(editingProduct.brandId?.toString() || "");
      setSelectedUnit(editingProduct.unit || "");
    } else {
      setSelectedCategoryId("");
      setSelectedBrandId("");
      setSelectedUnit("");
    }
  }, [editingProduct]);

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

  async function handleSubmit(formData) {
    setIsSaving(true);
    try {
      const productData = {
        productName: formData.get("productName"),
        productCode: formData.get("productCode") || null,
        unit: formData.get("unit") || null,
        capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
        sellPrice: Number(formData.get("sellPrice")),
        costPrice: Number(formData.get("costPrice")),
        discountRate: formData.get("discountRate") ? Number(formData.get("discountRate")) : 0,
        desc: formData.get("desc") || null,
        categoryId: formData.get("categoryId") ? Number(formData.get("categoryId")) : null,
        brandId: formData.get("brandId") ? Number(formData.get("brandId")) : null,
        picture: editingProduct?.picture || null,
      };

      if (!productData.productName) {
        throw new Error(t("Product name is required"));
      }
      if (!productData.categoryId) {
        throw new Error(t("Category is required"));
      }
      if (productData.sellPrice < 0) {
        throw new Error(t("Sell price must be non-negative"));
      }
      if (productData.costPrice < 0) {
        throw new Error(t("Cost price must be non-negative"));
      }

      if (selectedFile) {
        const validationError = validateFile(selectedFile, 5);
        if (validationError) {
          throw new Error(validationError);
        }
      }

      const { create, update } = useProductStore.getState();
      const success = editingProduct
        ? await update(editingProduct.productId, productData, selectedFile)
        : await create(productData, selectedFile);

      if (success) {
        setIsDialogOpen(false);
        setSelectedFile(null);
        setEditingProduct(null);
        router.refresh();
      } else {
        throw new Error(t("Product operation failed"));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  }

  const handleEdit = (product) => {
    if (!canUpdate) {
      return;
    }
    setEditingProduct(product);
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!canDelete) {
      return;
    }
    if (!confirm(t("Are you sure you want to delete this product?"))) return;

    try {
      const success = await prodDelete(productId);
      if (success) {
      } else {
        throw new Error(t("Failed to delete product"));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRetry = () => {
    prodFetch();
    cateFetch();
    brandFetch();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Products")}</h1>
          <p className="text-muted-foreground">{t("Manage your fertilizer inventory and product catalog")}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={prodLoading || cateLoading || brandLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${prodLoading || cateLoading || brandLoading ? "animate-spin" : ""}`} />
            {t("Refresh")}
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setSelectedFile(null);
                setEditingProduct(null);
              }
            }}
          >
            <DialogTrigger asChild>
              {canCreate && (
                <Button disabled={activeCategories.length === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("Add Product")}
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? t("Edit Product") : t("Add New Product")}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? t("Update product information") : t("Create a new product in your inventory")}
                </DialogDescription>
              </DialogHeader>
              <form action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">{t("Product Name")} *</Label>
                    <Input
                      id="productName"
                      name="productName"
                      required
                      defaultValue={editingProduct?.productName ?? ""}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">{t("Category")} *</Label>
                    <Combobox
                      id="categoryId"
                      name="categoryId"
                      options={activeCategories.map(category => ({ value: category.categoryId.toString(), label: category.categoryName }))}
                      placeholder={t("Select category...")}
                      value={selectedCategoryId}
                      onChange={setSelectedCategoryId}
                      disabled={isSaving}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brandId">{t("Brand")}</Label>
                    <Combobox
                      id="brandId"
                      name="brandId"
                      options={[{ value: "", label: t("No brand") }, ...activeBrands.map(brand => ({ value: brand.brandId.toString(), label: brand.brandName }))]}
                      placeholder={t("Select brand...")}
                      value={selectedBrandId}
                      onChange={setSelectedBrandId}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productCode">{t("Product Code")}</Label>
                    <Input
                      id="productCode"
                      name="productCode"
                      placeholder="You can leave this blank."
                      defaultValue={editingProduct?.productCode ?? ""}
                      disabled={isSaving}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">{t("Capacity")}</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.capacity ?? ""}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">{t("Unit")}</Label>
                    <Combobox
                      id="unit"
                      name="unit"
                      options={unit.map(u => ({ value: u.value, label: u.label }))}
                      placeholder={t("Select unit...")}
                      value={selectedUnit}
                      onChange={setSelectedUnit}
                      disabled={isSaving}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">{t("Cost Price")} *</Label>
                    <Input
                      id="costPrice"
                      name="costPrice"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={editingProduct?.costPrice ?? ""}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellPrice">{t("Sell Price")} *</Label>
                    <Input
                      id="sellPrice"
                      name="sellPrice"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={editingProduct?.sellPrice ?? ""}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountRate">{t("Discount %")}</Label>
                    <Input
                      id="discountRate"
                      name="discountRate"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={editingProduct?.discountRate ?? 0}
                      disabled={isSaving}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("Product Image")}</Label>
                    <FileUpload
                      onFileSelect={(file) => setSelectedFile(file)}
                      accept="image/*"
                      maxSize={5}
                      preview={true}
                      value={selectedFile}
                      placeholder={t("Upload product image")}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">{t("Description")}</Label>
                    <Textarea
                      id="desc"
                      name="desc"
                      rows={9}
                      defaultValue={editingProduct?.desc ?? ""}
                      disabled={isSaving}
                    />
                  </div>
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

      {(prodError || cateError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">{t("Error loading data")}</p>
                <p className="text-sm text-muted-foreground">{prodError || cateError}</p>
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
              <CardDescription>
                {filteredProducts.length} {t("products in your catalog")}
              </CardDescription>
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
  );
}


// // app/products/page.tsx
// "use client";
// export const dynamic = "force-dynamic";

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
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { FileUpload } from "@/components/ui/file-upload";
// import { ViewToggle } from "@/components/ui/view-toggle";
// import { DataTable } from "@/components/ui/data-table";
// import { DataCards } from "@/components/ui/data-cards";
// import { Plus, Search, Package, Loader2, RefreshCw } from "lucide-react";
// import { useTranslation } from "react-i18next";
// import { useRouter } from "next/navigation";
// import { validateFile } from "@/lib/file-upload";
// import { useProductStore, useCategoryStore, useBrandStore } from "@/stores";
// import { usePermissions } from "@/hooks/use-permissions";
// import { unit } from "@/constant";

// export default function ProductsPage() {
//   const { t } = useTranslation("common");
//   const {
//     items: products,
//     isLoading: prodLoading,
//     error: prodError,
//     fetch: prodFetch,
//     delete: prodDelete,
//   } = useProductStore();
//   const {
//     items: categories,
//     isLoading: cateLoading,
//     error: cateError,
//     fetch: cateFetch,
//   } = useCategoryStore();
//   const {
//     items: brands,
//     isLoading: brandLoading,
//     fetch: brandFetch,
//   } = useBrandStore();
  
//   const { canCreate, canUpdate, canDelete } = usePermissions();
//   const router = useRouter();
//   const [isSaving, setIsSaving] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [view, setView] = useState("table");
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [editingProduct, setEditingProduct] = useState(null);

//   useEffect(() => {
//     prodFetch();
//     cateFetch();
//     brandFetch();
//   }, [prodFetch, cateFetch, brandFetch]);

//   const activeCategories = categories.filter((cate) => cate.status === "active");
//   const activeBrands = brands.filter((brand) => brand.status === "active");
//   const activeProducts = products.filter((prod) => prod.status === "active");

//   const filteredProducts = activeProducts.filter(
//     (product) =>
//       product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const tableColumns = [
//     { key: "productName", label: t("Product"), type: "image" },
//     {
//       key: "Category.categoryName",
//       label: t("Category"),
//       render: (_value, row) => row.Category?.categoryName ?? t("Unknown"),
//     },
//     {
//       key: "unit_capacity",
//       label: t("Unit/Capacity"),
//       render: (_value, row) =>
//         row.unit && row.capacity != null ? `${row.capacity} ${row.unit}` : row.unit || row.capacity || "-",
//     },
//     { key: "costPrice", label: t("Cost Price"), type: "currency" },
//     { key: "sellPrice", label: t("Sell Price"), type: "currency" },
//     {
//       key: "Stock.quantity",
//       label: t("Stock"),
//       type: "badge",
//       render: (_value, row) => row.Stock?.reduce((sum, stock) => sum + stock.quantity, 0) ?? 0,
//     },
//     { key: "status", label: t("Status"), type: "badge" },
//   ];

//   const cardFields = [
//     { key: "picture", type: "image" },
//     { key: "productName", primary: true },
//     { key: "productCode", secondary: true },
//     {
//       key: "Category.categoryName",
//       label: t("Category"),
//       render: (_value, row) => row.Category?.categoryName ?? t("Unknown"),
//     },
//     { key: "costPrice", label: t("Cost"), type: "currency" },
//     { key: "sellPrice", label: t("Price"), type: "currency" },
//     {
//       key: "Stock.quantity",
//       label: t("Stock"),
//       type: "badge",
//       render: (_value, row) => row.Stock?.reduce((sum, stock) => sum + stock.quantity, 0) ?? 0,
//     },
//   ];

//   async function handleSubmit(formData) {
//     setIsSaving(true);

//     try {
//       const productData = {
//         productName: formData.get("productName"),
//         productCode: formData.get("productCode") | null,
//         unit: formData.get("unit") | null,
//         capacity: formData.get("capacity") ? formData.get("capacity") : null,
//         sellPrice: formData.get("sellPrice"),
//         costPrice: formData.get("costPrice"),
//         discountRate: parseInt(formData.get("discountRate")) || 0,
//         desc: formData.get("desc") | null,
//         categoryId: formData.get("categoryId"),
//         brandId: formData.get("brandId") | null,
//         picture: editingProduct?.picture || null,
//       };

//       if (!productData.productName) {
//         throw new Error(t("Product name is required"));
//       }
//       if (!productData.categoryId) {
//         throw new Error(t("Category is required"));
//       }
//       if (parseFloat(productData.sellPrice) < 0) {
//         throw new Error(t("Sell price must be non-negative"));
//       }
//       if (parseFloat(productData.costPrice) < 0) {
//         throw new Error(t("Cost price must be non-negative"));
//       }

//       if (selectedFile) {
//         const validationError = validateFile(selectedFile, 5);
//         if (validationError) {
//           throw new Error(validationError);
//         }
//       }

//       const { create, update } = useProductStore.getState();
//       const success = editingProduct
//         ? await update(editingProduct.productId, productData, selectedFile)
//         : await create(productData, selectedFile);

//       if (success) {
//         setIsDialogOpen(false);
//         setSelectedFile(null);
//         setEditingProduct(null);
//         router.refresh();
//       } else {
//         throw new Error(t("Product operation failed"));
//       }
//     } catch (error) {
//       console.log(error)
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   const handleEdit = (product) => {
//     if (!canUpdate) {
//       return;
//     }
//     setEditingProduct(product);
//     setSelectedFile(null);
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (productId) => {
//     if (!canDelete) {
//       return;
//     }
//     if (!confirm(t("Are you sure you want to delete this product?"))) return;

//     try {
//       const success = await prodDelete(productId);
//       if (success) {
//       } else {
//         throw new Error(t("Failed to delete product"));
//       }
//     } catch (error) {
//       console.log(error)
//     }
//   };

//   const handleRetry = () => {
//     prodFetch();
//     cateFetch();
//     brandFetch();
//   };

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">{t("Products")}</h1>
//           <p className="text-muted-foreground">{t("Manage your fertilizer inventory and product catalog")}</p>
//         </div>

//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleRetry} disabled={prodLoading || cateLoading || brandLoading}>
//             <RefreshCw className={`mr-2 h-4 w-4 ${prodLoading || cateLoading || brandLoading ? "animate-spin" : ""}`} />
//             {t("Refresh")}
//           </Button>
//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open);
//               if (!open) {
//                 setSelectedFile(null);
//                 setEditingProduct(null);
//               }
//             }}
//           >
//             <DialogTrigger asChild>
//               {canCreate && (
//                 <Button disabled={activeCategories.length === 0}>
//                   <Plus className="mr-2 h-4 w-4" />
//                   {t("Add Product")}
//                 </Button>
//               )}
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>{editingProduct ? t("Edit Product") : t("Add New Product")}</DialogTitle>
//                 <DialogDescription>
//                   {editingProduct ? t("Update product information") : t("Create a new product in your inventory")}
//                 </DialogDescription>
//               </DialogHeader>
//               <form action={handleSubmit} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="productName">{t("Product Name")} *</Label>
//                     <Input
//                       id="productName"
//                       name="productName"
//                       required
//                       defaultValue={editingProduct?.productName ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="categoryId">{t("Category")} *</Label>
//                     <Select
//                       name="categoryId"
//                       required
//                       defaultValue={editingProduct?.categoryId ?? ""}
//                       disabled={isSaving}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder={t("Select category")} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {activeCategories.length > 0 ? (
//                           activeCategories.map((category) => (
//                             <SelectItem key={category.categoryId} value={category.categoryId}>
//                               {category.categoryName}
//                             </SelectItem>
//                           ))
//                         ) : (
//                           <SelectItem value="no-categories" disabled>
//                             {t("No categories available")}
//                           </SelectItem>
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="brandId">{t("Brand")}</Label>
//                     <Select
//                       name="brandId"
//                       defaultValue={editingProduct?.brandId ?? ""}
//                       disabled={isSaving}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder={t("Select brand")} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="">{t("No brand")}</SelectItem>
//                         {activeBrands.map((brand) => (
//                           <SelectItem key={brand.brandId} value={brand.brandId}>
//                             {brand.brandName}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="productCode">{t("Product Code")}</Label>
//                     <Input
//                       id="productCode"
//                       name="productCode"
//                       defaultValue={editingProduct?.productCode ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="capacity">{t("Capacity")}</Label>
//                     <Input
//                       id="capacity"
//                       name="capacity"
//                       type="number"
//                       step="0.01"
//                       defaultValue={editingProduct?.capacity ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="unit">{t("Unit")}</Label>
//                     <Select
//                       name="unit"
//                       defaultValue={editingProduct?.unit ?? ""}
//                       disabled={isSaving}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder={t("Select unit")} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {unit.map((u) => (
//                           <SelectItem key={u.value} value={u.value}>
//                             {u.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="costPrice">{t("Cost Price")} *</Label>
//                     <Input
//                       id="costPrice"
//                       name="costPrice"
//                       type="number"
//                       step="0.01"
//                       required
//                       defaultValue={editingProduct?.costPrice ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="sellPrice">{t("Sell Price")} *</Label>
//                     <Input
//                       id="sellPrice"
//                       name="sellPrice"
//                       type="number"
//                       step="0.01"
//                       required
//                       defaultValue={editingProduct?.sellPrice ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="discountRate">{t("Discount %")}</Label>
//                     <Input
//                       id="discountRate"
//                       name="discountRate"
//                       type="number"
//                       min="0"
//                       max="100"
//                       defaultValue={editingProduct?.discountRate ?? 0}
//                       disabled={isSaving}
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>{t("Product Image")}</Label>
//                     <FileUpload
//                       onFileSelect={(file) => setSelectedFile(file)}
//                       accept="image/*"
//                       maxSize={5}
//                       preview={true}
//                       value={selectedFile}
//                       placeholder={t("Upload product image")}
//                       disabled={isSaving}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="desc">{t("Description")}</Label>
//                     <Textarea
//                       id="desc"
//                       name="desc"
//                       rows={9}
//                       defaultValue={editingProduct?.desc ?? ""}
//                       disabled={isSaving}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setIsDialogOpen(false)}
//                     disabled={isSaving}
//                   >
//                     {t("Cancel")}
//                   </Button>
//                   {(canCreate || canUpdate) && (
//                     <Button type="submit" disabled={isSaving}>
//                       {isSaving ? (
//                         <>
//                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                           {editingProduct ? t("Updating...") : t("Creating...")}
//                         </>
//                       ) : editingProduct ? (
//                         t("Update Product")
//                       ) : (
//                         t("Create Product")
//                       )}
//                     </Button>
//                   )}
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </motion.div>

//       {(prodError || cateError) && (
//         <Card className="border-destructive">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-destructive font-medium">{t("Error loading data")}</p>
//                 <p className="text-sm text-muted-foreground">{prodError || cateError}</p>
//               </div>
//               <Button variant="outline" onClick={handleRetry} disabled={prodLoading || cateLoading || brandLoading}>
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
//                 <Package className="h-5 w-5" />
//                 {t("Product Inventory")}
//                 {(prodLoading || cateLoading || brandLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
//               </CardTitle>
//               <CardDescription>
//                 {filteredProducts.length} {t("products in your catalog")}
//               </CardDescription>
//             </div>
//             <ViewToggle view={view} onViewChange={setView} />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
//               />
//               <Input
//                 placeholder={t("Search products...")}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//                 disabled={prodLoading || cateLoading || brandLoading}
//               />
//             </div>
//           </div>

//           {view === "card" ? (
//             <DataCards
//               data={filteredProducts}
//               fields={cardFields}
//               loading={prodLoading || cateLoading || brandLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="productId"
//               imageField="picture"
//               nameField="productName"
//               columns={4}
//             />
//           ) : (
//             <DataTable
//               data={filteredProducts}
//               columns={tableColumns}
//               loading={prodLoading || cateLoading || brandLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="productId"
//               imageField="picture"
//               nameField="productName"
//             />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


