"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { uploadFileServerAction } from "@/app/actions/files"

export async function getAllCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        Employee: { select: { firstName: true, lastName: true } },
        Customerinfo: true,
        Sale: true,
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
            govExpire: customer.Customerinfo.govExpire
              ? customer.Customerinfo.govExpire.toISOString()
              : null,
          }
        : null,
    }))

    return { success: true, customers: serializedCustomers }
  } catch (error) {
    console.error("Customers fetch error:", error?.message)
    return { success: false, error: "Failed to fetch customers" }
  }
}

export async function createCustomer(data) {
  try {
    const customer = await prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender || "male",
        phone: data.phone || null,
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

export async function updateCustomer(customerId, data) {
  try {
    const customer = await prisma.customer.update({
      where: { customerId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender || "male",
        phone: data.phone || null,
        status: data.status || "active",
        employeeId: data.employeeId || null,
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

export async function createCustomerInfo(data, pictureFile, govPictureFile) {
  try {
    console.log("Creating customer info with:", {
      data,
      hasPicture: !!pictureFile,
      pictureType: pictureFile?.type,
      pictureName: pictureFile?.name,
      hasGovPicture: !!govPictureFile,
      govPictureType: govPictureFile?.type,
      govPictureName: govPictureFile?.name,
    })

    let pictureUrl = null
    let govPictureUrl = null

    if (pictureFile && pictureFile instanceof File) {
      console.log("Uploading picture:", pictureFile.name)
      const formData = new FormData()
      formData.append("file", pictureFile)
      formData.append("aspectRatio", "original")
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Picture upload failed")
      }
      pictureUrl = uploadResult.url
    }

    if (govPictureFile && govPictureFile instanceof File) {
      console.log("Uploading gov picture:", govPictureFile.name)
      const formData = new FormData()
      formData.append("file", govPictureFile)
      formData.append("aspectRatio", "original")
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Gov picture upload failed")
      }
      govPictureUrl = uploadResult.url
    }

    const customerInfo = await prisma.customerinfo.create({
      data: {
        customerId: data.customerId,
        picture: pictureUrl,
        region: data.region || null,
        email: data.email || null,
        note: data.note || null,
        loyaltyPoints: data.loyaltyPoints ? parseInt(data.loyaltyPoints) : 0,
        lastPurchaseDate: data.lastPurchaseDate ? new Date(data.lastPurchaseDate) : new Date(),
        govId: data.govId || null,
        govPicture: govPictureUrl,
        govExpire: data.govExpire ? new Date(data.govExpire) : null,
        status: data.status || "active",
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

export async function updateCustomerInfo(customerId, data, pictureFile, govPictureFile) {
  try {
    console.log("Updating customer info with:", {
      customerId,
      data,
      hasPicture: !!pictureFile,
      pictureType: pictureFile?.type,
      pictureName: pictureFile?.name,
      hasGovPicture: !!govPictureFile,
      govPictureType: govPictureFile?.type,
      govPictureName: govPictureFile?.name,
    })

    const currentCustomerInfo = await prisma.customerinfo.findUnique({
      where: { customerId },
      select: { picture: true, govPicture: true },
    })

    let pictureUrl = currentCustomerInfo?.picture || null
    let govPictureUrl = currentCustomerInfo?.govPicture || null

    if (pictureFile && pictureFile instanceof File) {
      console.log("Uploading new picture:", pictureFile.name)
      const formData = new FormData()
      formData.append("file", pictureFile)
      formData.append("aspectRatio", "original")
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Picture upload failed")
      }
      pictureUrl = uploadResult.url
    }

    if (govPictureFile && govPictureFile instanceof File) {
      console.log("Uploading new gov picture:", govPictureFile.name)
      const formData = new FormData()
      formData.append("file", govPictureFile)
      formData.append("aspectRatio", "original")
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Gov picture upload failed")
      }
      govPictureUrl = uploadResult.url
    }

    const customerInfo = await prisma.customerinfo.update({
      where: { customerId },
      data: {
        picture: pictureUrl,
        region: data.region || null,
        email: data.email || null,
        note: data.note || null,
        loyaltyPoints: data.loyaltyPoints ? parseInt(data.loyaltyPoints) : 0,
        lastPurchaseDate: data.lastPurchaseDate ? new Date(data.lastPurchaseDate) : new Date(),
        govId: data.govId || null,
        govPicture: govPictureUrl,
        govExpire: data.govExpire ? new Date(data.govExpire) : null,
        status: data.status || "active",
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