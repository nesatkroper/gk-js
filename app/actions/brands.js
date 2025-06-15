


"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { uploadFileServerAction } from "@/app/actions/files"
import { generateBrandCode } from "@/lib/utils"

export async function fetchBrands() {
  try {
    const brands = await prisma.brand.findMany({
      where: { status: "active" },
      include: {
        _count: {
          select: { Product: true },
        },
      },
      orderBy: { brandName: "asc" },
    })
    return { success: true, data: brands }
  } catch (error) {
    console.error("Brands fetch error:", error?.message)
    return { success: false, error: "Failed to fetch brands" }
  }
}

export async function createBrand(data, file) {
  try {
    console.log("Creating brand with:", {
      data,
      hasFile: !!file,
      fileType: file?.type,
      fileName: file?.name,
    })

    let pictureUrl = null
    const brandCode = generateBrandCode()

    if (file && file instanceof File) {
      console.log("Uploading file:", file.name)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("aspectRatio", "original")

      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })

      console.log("Upload result:", uploadResult)

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "File upload failed")
      }
      pictureUrl = uploadResult.url
    }

    console.log("Creating brand with picture URL:", pictureUrl)

    const brand = await prisma.brand.create({
      data: {
        brandName: data.brandName,
        brandCode,
        picture: pictureUrl,
        memo: data.memo || null,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/brands")
    return { success: true, data: brand }
  } catch (error) {
    console.error("Brand creation error:", error?.message)
    return { success: false, error: error?.message || "Failed to create brand" }
  }
}

export async function updateBrand(brandId, data, file) {
  try {
    console.log("Updating brand with:", {
      brandId,
      data,
      hasFile: !!file,
      fileType: file?.type,
      fileName: file?.name,
    })

    const currentBrand = await prisma.brand.findUnique({
      where: { brandId },
      select: { picture: true },
    })

    let pictureUrl = currentBrand?.picture || data.picture || null

    if (file && file instanceof File) {
      console.log("Uploading new file:", file.name)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("aspectRatio", "original")

      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })

      console.log("Upload result:", uploadResult)

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "File upload failed")
      }
      pictureUrl = uploadResult.url
    }

    console.log("Updating brand with picture URL:", pictureUrl)

    const brand = await prisma.brand.update({
      where: { brandId },
      data: {
        brandName: data.brandName,
        brandCode: data.brandCode,
        picture: pictureUrl,
        memo: data.memo || null,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/brands")
    return { success: true, data: brand }
  } catch (error) {
    console.error("Brand update error:", error?.message)
    return { success: false, error: error?.message || "Failed to update brand" }
  }
}

export async function deleteBrand(brandId) {
  try {
    await prisma.brand.update({
      where: { brandId },
      data: { status: "inactive" },
    })
    revalidatePath("/brands")
    return { success: true }
  } catch (error) {
    console.error("Brand deletion error:", error?.message)
    return { success: false, error: "Failed to delete brand" }
  }
}

