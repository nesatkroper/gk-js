"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { useTranslation } from "react-i18next" // Already here, perfect!
import { Button } from "@/components/ui/button"
import { useFormHandler } from "@/hooks/use-form"
import { useBrandStore } from "@/stores/brand-store"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { ViewToggle } from "@/components/ui/view-toggle"
import { FormImagePreview, FormImageResize, FormInput, FormTextArea } from "@/components/form"
import { createBrand, updateBrand } from "@/app/actions/brands"
import { Plus, Search, Tag, Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { usePermissions } from "@/hooks/use-permissions"
import { toast } from "sonner"

export default function BrandsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const { t } = useTranslation("common") // Your translation hook
  const { items, isLoading, error, fetch } = useBrandStore()
  const { canCreate } = usePermissions()
  const { formData, resetForm, setFormData, handleChange, handleImageData, getSubmissionData } = useFormHandler({
    brandName: "",
    brandCode: "",
    memo: "",
    picture: null,
  })

  useEffect(() => {
    fetch()
  }, [fetch])

  console.log(items)

  const activeBrands = items.filter((b) => b.status === "active")
  const filteredBrands = activeBrands.filter(
    (b) =>
      b.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.brandCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tableColumns = [
    { key: "brandName", label: t("Brand"), type: "image" }, // Translated "Brand"
    { key: "brandCode", label: t("Code"), render: (_value, row) => row.brandCode ?? "-" }, // Translated "Code"
    { key: "memo", label: t("Memo"), render: (_value, row) => row.memo ?? "-" }, // Translated "Memo"
    { key: "createdAt", label: t("Created"), type: "date" }, // Translated "Created"
    { key: "status", label: t("Status"), type: "badge" }, // Translated "Status"
  ]

  const cardFields = [
    { key: "picture", type: "image" },
    { key: "brandName", primary: true },
    { key: "brandCode", secondary: true, render: (_value, row) => row.brandCode ?? "-" },
    { key: "memo", label: t("Memo"), render: (_value, row) => row.memo ?? "-" }, // Translated "Memo"
    { key: "status", label: t("Status"), type: "badge" }, // Translated "Status"
    { key: "createdAt", label: t("Created"), type: "date" }, // Translated "Created"
  ]

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Extract data and file separately
      const { data, file } = getSubmissionData()

      console.log("Submitting:", { data, file: file?.name })

      const result = editingBrand ? await updateBrand(editingBrand.brandId, data, file) : await createBrand(data, file)

      if (!result.success) {
        throw new Error(result.error || t("Brand operation failed")) // Translated error message
      }

      toast.success(editingBrand ? t("Brand updated successfully") : t("Brand created successfully")) // Translated toast messages

      setIsDialogOpen(false)
      setEditingBrand(null)
      resetForm()

      await fetch()
    } catch (err) {
      console.error("Brand operation error:", err)
      toast.error(err.message || t("An error occurred")) // Translated error message
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (brand) => {
    setFormData({
      brandName: brand.brandName || "",
      brandCode: brand.brandCode || "",
      memo: brand.memo || "",
      picture: brand.picture || null, // This will be a URL string for existing brands
    })
    setEditingBrand(brand)
    setIsDialogOpen(true)
  }

  const handleRetry = () => {
    fetch()
  }

  const handleDialogClose = (open) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingBrand(null)
      resetForm()
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Brands")}</h1>
          <p className="text-muted-foreground">{t("Manage your brand catalog")}</p>
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
                {t("Add Brand")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingBrand ? t("Edit Brand") : t("Add New Brand")}</DialogTitle> {/* Translated titles */}
                <DialogDescription>
                  {editingBrand ? t("Update brand details") : t("Create a new brand in your catalog")} {/* Translated descriptions */}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  name="brandName"
                  disabled={isSaving}
                  label={t("Brand Name")} // Translated label
                  value={formData.brandName}
                  placeholder={t("Brand Name")} // Translated placeholder
                  onCallbackInput={handleChange}
                  required
                />

                <FormTextArea
                  rows={4}
                  name="memo"
                  label={t("Memo")} // Translated label
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
                    {t("Cancel")} {/* Translated "Cancel" */}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingBrand ? t("Updating...") : t("Creating...")} {/* Translated "Updating..." / "Creating..." */}
                      </>
                    ) : editingBrand ? (
                      t("Update Brand") // Translated "Update Brand"
                    ) : (
                      t("Create Brand") // Translated "Create Brand"
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
                <p className="text-destructive font-medium">{t("Error loading data")}</p> {/* Translated error message */}
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
                {t("Try Again")} {/* Translated "Try Again" */}
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
                <Tag className="h-5 w-5" />
                {t("Brand Catalog")} {/* Translated "Brand Catalog" */}
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              {/* This description dynamically displays a number, then a static string.
                  We need to combine `t()` with the dynamic part. */}
              <CardDescription>{t('X active brands', { count: filteredBrands.length })}</CardDescription> 
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search brands...")} // Translated placeholder
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredBrands}
              fields={cardFields}
              loading={isLoading}
              onEdit={handleEdit}
              idField="brandId"
              imageField="picture"
              nameField="brandName"
              columns={4}
            />
          ) : (
            <DataTable
              data={filteredBrands}
              columns={tableColumns}
              loading={isLoading}
              onEdit={handleEdit}
              idField="brandId"
              imageField="picture"
              nameField="brandName"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}


// "use client"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { Input } from "@/components/ui/input"
// import { useTranslation } from "react-i18next"
// import { Button } from "@/components/ui/button"
// import { useFormHandler } from "@/hooks/use-form"
// import { useBrandStore } from "@/stores/brand-store"
// import { DataTable } from "@/components/ui/data-table"
// import { DataCards } from "@/components/ui/data-cards"
// import { ViewToggle } from "@/components/ui/view-toggle"
// import { FormImagePreview, FormImageResize, FormInput, FormTextArea } from "@/components/form"
// import { createBrand, updateBrand } from "@/app/actions/brands"
// import { Plus, Search, Tag, Loader2, RefreshCw } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { usePermissions } from "@/hooks/use-permissions"
// import { toast } from "sonner"

// export default function BrandsPage() {
//   const [isSaving, setIsSaving] = useState(false)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [view, setView] = useState("table")
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [editingBrand, setEditingBrand] = useState(null)
//   const { t } = useTranslation("common")
//   const { items, isLoading, error, fetch } = useBrandStore()
//   const { canCreate } = usePermissions()
//   const { formData, resetForm, setFormData, handleChange, handleImageData, getSubmissionData } = useFormHandler({
//     brandName: "",
//     brandCode: "",
//     memo: "",
//     picture: null,
//   })

//   useEffect(() => {
//     fetch()
//   }, [fetch])

//   console.log(items)

//   const activeBrands = items.filter((b) => b.status === "active")
//   const filteredBrands = activeBrands.filter(
//     (b) =>
//       b.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       b.brandCode?.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   const tableColumns = [
//     { key: "brandName", label: "Brand", type: "image" },
//     { key: "brandCode", label: "Code", render: (_value, row) => row.brandCode ?? "-" },
//     { key: "memo", label: "Memo", render: (_value, row) => row.memo ?? "-" },
//     { key: "createdAt", label: "Created", type: "date" },
//     { key: "status", label: "Status", type: "badge" },
//   ]

//   const cardFields = [
//     { key: "picture", type: "image" },
//     { key: "brandName", primary: true },
//     { key: "brandCode", secondary: true, render: (_value, row) => row.brandCode ?? "-" },
//     { key: "memo", label: "Memo", render: (_value, row) => row.memo ?? "-" },
//     { key: "status", label: "Status", type: "badge" },
//     { key: "createdAt", label: "Created", type: "date" },
//   ]

//   async function handleSubmit(e) {
//     e.preventDefault()
//     setIsSaving(true)

//     try {
//       // Extract data and file separately
//       const { data, file } = getSubmissionData()

//       console.log("Submitting:", { data, file: file?.name })

//       const result = editingBrand ? await updateBrand(editingBrand.brandId, data, file) : await createBrand(data, file)

//       if (!result.success) {
//         throw new Error(result.error || "Brand operation failed")
//       }

//       toast.success(editingBrand ? "Brand updated successfully" : "Brand created successfully")

//       setIsDialogOpen(false)
//       setEditingBrand(null)
//       resetForm()

//       await fetch()
//     } catch (err) {
//       console.error("Brand operation error:", err)
//       toast.error(err.message || "An error occurred")
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const handleEdit = (brand) => {
//     setFormData({
//       brandName: brand.brandName || "",
//       brandCode: brand.brandCode || "",
//       memo: brand.memo || "",
//       picture: brand.picture || null, // This will be a URL string for existing brands
//     })
//     setEditingBrand(brand)
//     setIsDialogOpen(true)
//   }

//   const handleRetry = () => {
//     fetch()
//   }

//   const handleDialogClose = (open) => {
//     setIsDialogOpen(open)
//     if (!open) {
//       setEditingBrand(null)
//       resetForm()
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">{t("Brands")}</h1>
//           <p className="text-muted-foreground">{t("Manage your brand catalog")}</p>
//         </div>

//         <div className="flex gap-2">
//           {canCreate && (
//             <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
//               <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
//               {t("Refresh")}
//             </Button>
//           )}
//           <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
//             <DialogTrigger asChild>
//               <Button disabled={isLoading}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 {t("Add Brand")}
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[500px]">
//               <DialogHeader>
//                 <DialogTitle>{editingBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
//                 <DialogDescription>
//                   {editingBrand ? "Update brand details" : "Create a new brand in your catalog"}
//                 </DialogDescription>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <FormInput
//                   name="brandName"
//                   disabled={isSaving}
//                   label={t("Brand Name")}
//                   value={formData.brandName}
//                   placeholder={t("Brand Name")}
//                   onCallbackInput={handleChange}
//                   required
//                 />

//                 <FormTextArea
//                   rows={4}
//                   name="memo"
//                   label={t("Memo")}
//                   disabled={isSaving}
//                   value={formData.memo}
//                   onCallbackInput={handleChange}
//                 />

//                 <FormImageResize onCallbackData={handleImageData} />

//                 {formData.picture && (
//                   <FormImagePreview
//                     imgSrc={
//                       formData.picture instanceof File ? URL.createObjectURL(formData.picture) : formData.picture // This handles existing image URLs
//                     }
//                     height={200}
//                   />
//                 )}

//                 <div className="flex justify-end gap-2">
//                   <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSaving}>
//                     {t("Cancel")}
//                   </Button>
//                   <Button type="submit" disabled={isSaving}>
//                     {isSaving ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         {editingBrand ? "Updating..." : "Creating..."}
//                       </>
//                     ) : editingBrand ? (
//                       "Update Brand"
//                     ) : (
//                       "Create Brand"
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
//               <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
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
//                 <Tag className="h-5 w-5" />
//                 {t("Brand Catalog")}
//                 {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
//               </CardTitle>
//               <CardDescription>{filteredBrands.length} active brands</CardDescription>
//             </div>
//             <ViewToggle view={view} onViewChange={setView} />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search brands..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//                 disabled={isLoading}
//               />
//             </div>
//           </div>

//           {view === "card" ? (
//             <DataCards
//               data={filteredBrands}
//               fields={cardFields}
//               loading={isLoading}
//               onEdit={handleEdit}
//               idField="brandId"
//               imageField="picture"
//               nameField="brandName"
//               columns={4}
//             />
//           ) : (
//             <DataTable
//               data={filteredBrands}
//               columns={tableColumns}
//               loading={isLoading}
//               onEdit={handleEdit}
//               idField="brandId"
//               imageField="picture"
//               nameField="brandName"
//             />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


