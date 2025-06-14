
"use client"
export const dynamic = "force-dynamic"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { useFormHandler } from "@/hooks/use-form"
import { useBrandStore } from "@/stores/brand-store"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { ViewToggle } from "@/components/ui/view-toggle"
import { FileUpload } from "@/components/ui/file-upload"
import { FormInput, FormTextArea } from '@/components/form'
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

export default function BrandsPage() {
  const { t } = useTranslation("common")
  const { items, isLoading, error, fetch } = useBrandStore()

  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [editingBrand, setEditingBrand] = useState(null)
  const {
    formData,
    handleChange,
    resetForm,
  } = useFormHandler({
    brandName: "",
    brandCode: "",
    memo: "",
    picture: null
  })

  useEffect(() => {
    fetch()
  }, [fetch])

  const activeBrands = items.filter((b) => b.status === "active")

  const filteredBrands = activeBrands.filter(
    (b) =>
      b.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.brandCode?.toLowerCase().includes(searchTerm.toLowerCase())
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

  async function handleSubmit(formData) {
    setIsSaving(true)
    console.log(formData)

    try {
      const brandData = {
        brandName: formData.get("brandName"),
        brandCode: formData.get("brandCode") || null,
        memo: formData.get("memo") || null,
        picture: editingBrand?.picture || null,
      }

      if (!brandData.brandName) {
        throw new Error("Brand name is required")
      }

      const success = editingBrand
        ? await updateBrand(editingBrand.brandId, brandData, formData.picture)
        : await createBrand(brandData, formData.picture)


      if (!success) {
        throw new Error("Brand operation failed")
      }

      setIsDialogOpen(false)
      setSelectedFile(null)
      setEditingBrand(null)
      resetForm()
      router.refresh()
    } catch (err) {
      console.error("Brand operation error:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (brand) => {
    setEditingBrand(brand)
    setSelectedFile(null)
    setIsDialogOpen(true)
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
          <h1 className="text-3xl font-bold tracking-tight">{t("Brands")}</h1>
          <p className="text-muted-foreground">{t("Manage your brand catalog")}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("Refresh")}
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setSelectedFile(null)
                setEditingBrand(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
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
              <form action={handleSubmit} className="space-y-4">


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

                <div className="space-y-2">
                  <Label>{t("Brand Image")}</Label>
                  <FileUpload
                    onFileSelect={(file) => setSelectedFile(file)}
                    accept="image/*"
                    maxSize={5}
                    preview={true}
                    value={selectedFile}
                    placeholder="Upload brand image"
                    disabled={isSaving}
                  />
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
              onDelete={handleDelete}
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
              onDelete={handleDelete}
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
