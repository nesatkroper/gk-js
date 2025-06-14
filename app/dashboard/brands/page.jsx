"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation("common")
  const { items, isLoading, error, fetch } = useBrandStore()

  const [isSaving, setIsSaving] = useState(false)
  const { canCreate } = usePermissions()
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [editingBrand, setEditingBrand] = useState(null)
  const { formData, resetForm, setFormData, handleChange, handleImageData } = useFormHandler({
    brandName: "",
    brandCode: "",
    memo: "",
    picture: null,
  })

  useEffect(() => {
    fetch()
  }, [fetch])

  const activeBrands = items.filter((b) => b.status === "active")
  const filteredBrands = activeBrands.filter(
    (b) =>
      b.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.brandCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tableColumns = [
    { key: "brandName", label: "Brand", type: "image" },
    { key: "brandCode", label: "Code", render: (_value, row) => row.brandCode ?? "-" },
    { key: "memo", label: "Memo", render: (_value, row) => row.memo ?? "-" },
    { key: "createdAt", label: "Created", type: "date" },
    { key: "status", label: "Status", type: "badge" },
  ]

  const cardFields = [
    { key: "picture", type: "image" },
    { key: "brandName", primary: true },
    { key: "brandCode", secondary: true, render: (_value, row) => row.brandCode ?? "-" },
    { key: "memo", label: "Memo", render: (_value, row) => row.memo ?? "-" },
    { key: "status", label: "Status", type: "badge" },
    { key: "createdAt", label: "Created", type: "date" },
  ]

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSaving(true)

    try {
      const result = editingBrand
        ? await updateBrand(editingBrand.brandId, formData, selectedFile)
        : await createBrand(formData, selectedFile)

      if (!result.success) {
        throw new Error(result.error || "Brand operation failed")
      }

      toast.success(editingBrand ? "Brand updated successfully" : "Brand created successfully")

      setIsDialogOpen(false)
      setSelectedFile(null)
      setEditingBrand(null)
      resetForm()

      await fetch()
    } catch (err) {
      console.error("Brand operation error:", err)
      toast.error(err.message || "An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (brand) => {
    setFormData({
      brandName: brand.brandName || "",
      brandCode: brand.brandCode || "",
      memo: brand.memo || "",
      picture: brand.picture || null,
    })
    setEditingBrand(brand)
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const handleRetry = () => {
    fetch()
  }

  const handleDialogClose = (open) => {
    setIsDialogOpen(open)
    if (!open) {
      setSelectedFile(null)
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
                <DialogTitle>{editingBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
                <DialogDescription>
                  {editingBrand ? "Update brand details" : "Create a new brand in your catalog"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  name="brandName"
                  disabled={isSaving}
                  label={t("Brand Name")}
                  value={formData.brandName}
                  placeholder={t("Brand Name")}
                  onCallbackInput={handleChange}
                  required
                />

                <FormTextArea
                  rows={4}
                  name="memo"
                  label={t("Memo")}
                  disabled={isSaving}
                  value={formData.memo}
                  onCallbackInput={handleChange}
                />

                <FormImageResize onCallbackData={handleImageData} />

                {(formData.picture || editingBrand?.picture) && (
                  <FormImagePreview
                    imgSrc={
                      formData.picture instanceof File
                        ? URL.createObjectURL(formData.picture)
                        : editingBrand?.picture || null
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
                        {editingBrand ? "Updating..." : "Creating..."}
                      </>
                    ) : editingBrand ? (
                      "Update Brand"
                    ) : (
                      "Create Brand"
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
                <Tag className="h-5 w-5" />
                {t("Brand Catalog")}
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredBrands.length} active brands</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands..."
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

// import React, { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { useRouter } from "next/navigation"
// import { Input } from "@/components/ui/input"
// import { useTranslation } from "react-i18next"
// import { Button } from "@/components/ui/button"
// import { useFormHandler } from "@/hooks/use-form"
// import { useBrandStore } from "@/stores/brand-store"
// import { DataTable } from "@/components/ui/data-table"
// import { DataCards } from "@/components/ui/data-cards"
// import { ViewToggle } from "@/components/ui/view-toggle"
// import { FormImagePreview, FormImageResize, FormInput, FormTextArea } from '@/components/form'
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

// export default function BrandsPage() {
//   const { t } = useTranslation("common")
//   const { items, isLoading, error, fetch } = useBrandStore()

//   const router = useRouter()
//   const [isSaving, setIsSaving] = useState(false)
//   const { canCreate } = usePermissions()
//   const [searchTerm, setSearchTerm] = useState("")
//   const [view, setView] = useState("table")
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [selectedFile, setSelectedFile] = useState(null)
//   const [editingBrand, setEditingBrand] = useState(null)
//   const {
//     formData,
//     resetForm,
//     setFormData,
//     handleChange,
//     handleImageData,
//     getFormDataForSubmission,
//   } = useFormHandler({
//     brandName: "",
//     brandCode: "",
//     memo: "",
//     picture: null
//   })

//   useEffect(() => {
//     fetch()
//   }, [fetch])

//   const activeBrands = items.filter((b) => b.status === "active")
//   const filteredBrands = activeBrands.filter(
//     (b) =>
//       b.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       b.brandCode?.toLowerCase().includes(searchTerm.toLowerCase())
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

//       const success = editingBrand
//         ? await updateBrand(editingBrand.brandId, formData, selectedFile)
//         : await createBrand(formData, selectedFile)


//       if (!success) {
//         throw new Error("Brand operation failed")
//       }

//       setIsDialogOpen(false)
//       setSelectedFile(null)
//       setEditingBrand(null)
//       resetForm()
//       router.refresh()
//     } catch (err) {
//       console.error("Brand operation error:", err)
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const handleEdit = (b) => {
//     setFormData(b)
//     setEditingBrand(b)
//     setSelectedFile(b.picture || null)
//     setIsDialogOpen(true)
//   }

//   const handleRetry = () => {
//     fetch()
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
//           {canCreate && <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
//             <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
//             {t("Refresh")}
//           </Button>}
//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open)
//               if (!open) {
//                 setSelectedFile(null)
//                 setEditingBrand(null)
//               }
//             }}
//           >
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
//               <form action={handleSubmit} className="space-y-4">


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

//                 <FormImagePreview imgSrc={
//                   formData.picture ? URL.createObjectURL(formData.picture) : null
//                 } height={200} />

//                 <div className="flex justify-end gap-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setIsDialogOpen(false)}
//                     disabled={isSaving}
//                   >
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
