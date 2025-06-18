"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { uploadFileServerAction } from "@/app/actions/files"

export async function getCustomers(options) {
  try {
    let customers

    if (options === "all") {
      customers = await prisma.customer.findMany({
        include: {
          Employee: { select: { firstName: true, lastName: true } },
          Customerinfo: true,
          Sale: true,
          Image: {
            select: {
              imageId: true,
              imageUrl: true,
              imageType: true,
              createdAt: true,
              updatedAt: true,
            },
          },

          // Image: { select: { imageId: true, imageUrl: true, imageType: true } },
        },
        orderBy: { createdAt: "desc" },
      })

      const serializedCustomers = customers.map((customer) => ({
        ...customer,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
        Customerinfo: customer.Customerinfo
          ? {
            ...customer.Customerinfo,
            lastPurchaseDate: customer.Customerinfo.lastPurchaseDate.toISOString(),
            govExpire: customer.Customerinfo.govExpire ? customer.Customerinfo.govExpire.toISOString() : null,
          }
          : null,
        Image: customer.Image.map((image) => ({
          ...image,
          createdAt: image.createdAt?.toISOString?.() || null,
          updatedAt: image.updatedAt?.toISOString?.() || null,
        })),
      }))

      return { success: true, customers: serializedCustomers }
    } else if (options === "withImage") {
      customers = await prisma.customer.findMany({
        select: {
          customerId: true,
          firstName: true,
          lastName: true,
          picture: true,
          Image: { select: { imageId: true, imageUrl: true, imageType: true } },
        },
        orderBy: { createdAt: "desc" },
      })

      const simplifiedCustomers = customers.map((customer) => ({
        customerId: customer.customerId,
        firstName: customer.firstName,
        lastName: customer.lastName,
        picture: customer.picture || null,
        images: customer.Image.map((image) => ({
          imageId: image.imageId,
          imageUrl: image.imageUrl,
          imageType: image.imageType,
        })),
      }))

      return { success: true, customers: simplifiedCustomers }
    } else {
      // "basic" option
      customers = await prisma.customer.findMany({
        select: {
          customerId: true,
          firstName: true,
          lastName: true,
          picture: true,
        },
        orderBy: { createdAt: "desc" },
      })

      return { success: true, customers }
    }
  } catch (error) {
    console.error("Customers fetch error:", error)
    return { success: false, error: "Failed to fetch customers" }
  }
}

export async function createCustomer(data, pictureFile) {
  try {
    let pictureUrl = null
    if (pictureFile && pictureFile instanceof File) {
      console.log("Uploading customer picture:", pictureFile.name)
      const formData = new FormData()
      formData.append("file", pictureFile)
      formData.append("aspectRatio", "original")
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Picture upload failed")
      }
      pictureUrl = uploadResult.url
    }

    const customer = await prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender || "male",
        phone: data.phone || null,
        picture: pictureUrl,
        status: data.status || "active",
        employeeId: data.employeeId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    revalidatePath("/customers")
    return {
      success: true,
      customer: {
        ...customer,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
      },
    }
  } catch (error) {
    console.error("Customer creation error:", error?.message)
    return { success: false, error: error?.message || "Failed to create customer" }
  }
}

export async function updateCustomer(customerId, data, pictureFile) {
  try {
    const currentCustomer = await prisma.customer.findUnique({
      where: { customerId },
      select: { picture: true },
    })

    let pictureUrl = currentCustomer?.picture || null
    if (pictureFile && pictureFile instanceof File) {
      console.log("Uploading new customer picture:", pictureFile.name)
      const formData = new FormData()
      formData.append("file", pictureFile)
      formData.append("aspectRatio", "original")
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Picture upload failed")
      }
      pictureUrl = uploadResult.url
    }

    const customer = await prisma.customer.update({
      where: { customerId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender || "male",
        phone: data.phone || null,
        picture: pictureUrl,
        status: data.status || "active",
        employeeId: data.employeeId || null,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/customers")
    return {
      success: true,
      customer: {
        ...customer,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
      },
    }
  } catch (error) {
    console.error("Customer update error:", error?.message)
    return { success: false, error: error?.message || "Failed to update customer" }
  }
}

export async function createCustomerInfo(data) {
  try {
    const customerInfo = await prisma.customerinfo.create({
      data: {
        customerId: data.customerId,
        album: data.album || [],
        region: data.region || null,
        email: data.email || null,
        refPhone: data.refPhone || null,
        loyaltyPoints: data.loyaltyPoints ? Number.parseInt(data.loyaltyPoints) : 0,
        lastPurchaseDate: data.lastPurchaseDate ? new Date(data.lastPurchaseDate) : new Date(),
        govId: data.govId || null,
        govExpire: data.govExpire ? new Date(data.govExpire) : null,
        contractPDF: data.contractPDF || null,
        note: data.note || null,
      },
    })

    revalidatePath("/customers")
    return {
      success: true,
      customerInfo: {
        ...customerInfo,
        lastPurchaseDate: customerInfo.lastPurchaseDate.toISOString(),
        govExpire: customerInfo.govExpire ? customerInfo.govExpire.toISOString() : null,
      },
    }
  } catch (error) {
    console.error("Customer info creation error:", error?.message)
    return { success: false, error: error?.message || "Failed to create customer info" }
  }
}

export async function updateCustomerInfo(customerId, data) {
  try {
    const customerInfo = await prisma.customerinfo.update({
      where: { customerId },
      data: {
        album: data.album || [],
        region: data.region || null,
        email: data.email || null,
        refPhone: data.refPhone || null,
        loyaltyPoints: data.loyaltyPoints ? Number.parseInt(data.loyaltyPoints) : 0,
        lastPurchaseDate: data.lastPurchaseDate ? new Date(data.lastPurchaseDate) : new Date(),
        govId: data.govId || null,
        govExpire: data.govExpire ? new Date(data.govExpire) : null,
        contractPDF: data.contractPDF || null,
        note: data.note || null,
      },
    })

    revalidatePath("/customers")
    return {
      success: true,
      customerInfo: {
        ...customerInfo,
        lastPurchaseDate: customerInfo.lastPurchaseDate.toISOString(),
        govExpire: customerInfo.govExpire ? customerInfo.govExpire.toISOString() : null,
      },
    }
  } catch (error) {
    console.error("Customer info update error:", error?.message)
    return { success: false, error: error?.message || "Failed to update customer info" }
  }
}

export async function uploadCustomerImages(customerId, imageFiles) {
  try {
    console.log("Uploading customer images:", { customerId, imageCount: imageFiles?.length || 0 })

    // Validate inputs
    if (!customerId) {
      throw new Error("Customer ID is required")
    }

    if (!imageFiles || !Array.isArray(imageFiles) || imageFiles.length === 0) {
      throw new Error("No images provided for upload")
    }

    const validImageTypes = ["address", "backId", "frontId", "card", "album", "product", "contract"]

    const uploadedImages = []
    for (const imageData of imageFiles) {
      if (!imageData || typeof imageData !== "object") {
        console.warn("Skipping invalid image data:", imageData)
        continue
      }

      const { file, imageType } = imageData

      if (!file || !(file instanceof File)) {
        console.warn("Skipping invalid file:", file)
        continue
      }

      if (!imageType || !validImageTypes.includes(imageType)) {
        console.warn("Skipping invalid image type:", imageType)
        continue
      }

      console.log(`Uploading ${imageType} image:`, file.name)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("aspectRatio", "original")

      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || `${imageType} image upload failed`)
      }

      const image = await prisma.image.create({
        data: {
          imageUrl: uploadResult.url,
          imageType,
          customerId,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      uploadedImages.push({
        imageId: image.imageId,
        imageUrl: image.imageUrl,
        imageType: image.imageType,
        createdAt: image.createdAt.toISOString(),
        updatedAt: image.updatedAt.toISOString(),
      })
    }

    if (uploadedImages.length === 0) {
      throw new Error("No valid images were uploaded")
    }

    revalidatePath("/customers")
    return { success: true, images: uploadedImages }
  } catch (error) {
    console.error("Customer images upload error:", error?.message)
    return { success: false, error: error?.message || "Failed to upload customer images" }
  }
}

export async function deleteCustomer(customerId) {
  try {
    await prisma.customer.update({
      where: { customerId },
      data: { status: "inactive" },
    })
    revalidatePath("/customers")
    return { success: true }
  } catch (error) {
    console.error("Customer deletion error:", error?.message)
    return { success: false, error: error?.message || "Failed to delete customer" }
  }
}


