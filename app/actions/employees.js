"use server"

import prisma from "@/lib/prisma"
import { uploadFileServerAction } from "@/app/actions/files"
import { revalidatePath } from "next/cache"
import { Decimal } from "@prisma/client"

function convertPrismaData(data) {
  try {
    if (data === null || data === undefined) return data

    // Handle Prisma Decimal objects
    if (data && typeof data === "object" && data.constructor && data.constructor.name === "Decimal") {
      return data.toNumber()
    }

    // Handle @prisma/client Decimal objects
    if (Decimal.isDecimal?.(data)) {
      return data.toNumber()
    }

    if (data instanceof Date) return data.toISOString()

    if (Array.isArray(data)) return data.map(convertPrismaData)

    if (typeof data === "object") {
      return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, convertPrismaData(value)]))
    }

    return data
  } catch (error) {
    console.error("Error converting Prisma data:", error)
    return data
  }
}

function mapContractType(formContractType) {
  const contractTypeMap = {
    fulltime: "permanent",
    parttime: "temporary",
    contract: "contract",
    intern: "intern",
  }
  return contractTypeMap[formContractType] || "permanent"
}

export async function getEmployees(options) {
  try {
    let employees

    if (options === "all") {
      employees = await prisma.employee.findMany({
        include: {
          Department: { select: { departmentName: true } },
          Position: { select: { positionName: true } },
          Branch: { select: { branchName: true } },
          Employeeinfo: true,
          Sale: true,
          Attendance: true,
          Image: { select: { imageId: true, imageUrl: true, imageType: true } },
        },
        orderBy: { createdAt: "desc" },
      })

      return {
        success: true,
        employees: employees.map(convertPrismaData),
      }
    } else if (options === "withImage") {
      employees = await prisma.employee.findMany({
        select: {
          employeeId: true,
          firstName: true,
          lastName: true,
          positionId: true,
          departmentId: true,
          picture: true,
          Position: { select: { positionName: true } },
          Department: { select: { departmentName: true } },
          Employeeinfo: {
            select: {
              managerId: true,
              album: true,
            },
          },
          Image: { select: { imageId: true, imageUrl: true, imageType: true } },
        },
        orderBy: { createdAt: "desc" },
      })

      return convertPrismaData({ success: true, employees })
    } else {
      employees = await prisma.employee.findMany({
        select: {
          employeeId: true,
          firstName: true,
          lastName: true,
          positionId: true,
          departmentId: true,
          Position: { select: { positionName: true } },
          Department: { select: { departmentName: true } },
        },
        orderBy: { createdAt: "desc" },
      })

      console.log(employees)

      return convertPrismaData({ success: true, employees })
    }
  } catch (error) {
    console.error("Employees fetch error:", error)
    return { success: false, error: "Failed to fetch employees" }
  }
}

export async function createEmployee(data, pictureFile) {
  try {
    let pictureUrl = null
    if (pictureFile && pictureFile instanceof File) {
      console.log("Uploading employee picture:", pictureFile.name)
      const formData = new FormData()
      formData.append("file", pictureFile)
      formData.append("aspectRatio", "original")
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Picture upload failed")
      }
      pictureUrl = uploadResult.url
    }

    const employee = await prisma.employee.create({
      data: {
        employeeCode: data.employeeCode || null,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender || "male",
        dob: data.dob ? new Date(data.dob) : null,
        phone: data.phone || null,
        email: data.email || null,
        departmentId: data.departmentId,
        positionId: data.positionId,
        branchId: data.branchId || null,
        salary: Number.parseFloat(data.salary) || 0,
        hiredDate: data.hiredDate ? new Date(data.hiredDate) : null,
        picture: pictureUrl,
        status: data.status || "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    revalidatePath("/dashboard/employees")

    // Convert the employee data before returning
    const convertedEmployee = convertPrismaData(employee)
    return { success: true, employee: convertedEmployee }
  } catch (error) {
    console.error("Create employee error:", error)
    return { success: false, error: error.message }
  }
}

export async function updateEmployee(employeeId, data, pictureFile) {
  try {
    const currentEmployee = await prisma.employee.findUnique({
      where: { employeeId },
      select: { picture: true },
    })

    let pictureUrl = currentEmployee?.picture || null
    if (pictureFile && pictureFile instanceof File) {
      console.log("Uploading new employee picture:", pictureFile.name)
      const formData = new FormData()
      formData.append("file", pictureFile)
      formData.append("aspectRatio", "original")
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Picture upload failed")
      }
      pictureUrl = uploadResult.url
    }

    const employee = await prisma.employee.update({
      where: { employeeId },
      data: {
        employeeCode: data.employeeCode || null,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender || "male",
        dob: data.dob ? new Date(data.dob) : null,
        phone: data.phone || null,
        email: data.email || null,
        departmentId: data.departmentId,
        positionId: data.positionId,
        branchId: data.branchId || null,
        salary: Number.parseFloat(data.salary) || 0,
        hiredDate: data.hiredDate ? new Date(data.hiredDate) : null,
        picture: pictureUrl,
        status: data.status || "active",
        updatedAt: new Date(),
      },
    })

    revalidatePath("/dashboard/employees")

    // Convert the employee data before returning
    const convertedEmployee = convertPrismaData(employee)
    return { success: true, employee: convertedEmployee }
  } catch (error) {
    console.error("Update employee error:", error)
    return { success: false, error: error.message }
  }
}

export async function createEmployeeInfo(data, albumFiles) {
  try {
    let albumUrls = data.album || []

    // Handle multiple album files upload
    if (albumFiles && Array.isArray(albumFiles) && albumFiles.length > 0) {
      albumUrls = []
      for (const file of albumFiles) {
        if (file instanceof File) {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("aspectRatio", "original")
          const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
          if (!uploadResult.success) throw new Error(uploadResult.error || "Album picture upload failed")
          albumUrls.push(uploadResult.url)
        }
      }
    }

    console.log("Creating employee info with URLs:", { albumUrls })

    const employeeInfo = await prisma.employeeinfo.create({
      data: {
        employeeId: data.employeeId,
        managerId: data.managerId || null,
        album: albumUrls,
        region: data.region || null,
        nationality: data.nationality || null,
        note: data.note || null,
        maritalStatus: data.maritalStatus || "single",
        emergencyContact: data.emergencyContact || null,
        bloodType: data.bloodType || null,
        bankAccount: data.bankAccount || null,
        govId: data.govId || null,
        govExpire: data.govExpire ? new Date(data.govExpire) : null,
        terminationDate: data.terminationDate ? new Date(data.terminationDate) : null,
        contractType: mapContractType(data.contractType),
      },
    })

    const employee = await prisma.employee.findUnique({
      where: { employeeId: data.employeeId },
      include: { Employeeinfo: true },
    })

    revalidatePath("/dashboard/employees")

    // Convert the employee data before returning
    const convertedEmployee = convertPrismaData(employee)
    return { success: true, employee: convertedEmployee }
  } catch (error) {
    console.error("Create employee info error:", error)
    return { success: false, error: error.message }
  }
}

export async function updateEmployeeInfo(employeeId, data, albumFiles) {
  try {
    let albumUrls = data.album || []

    // Handle multiple album files upload
    if (albumFiles && Array.isArray(albumFiles) && albumFiles.length > 0) {
      albumUrls = []
      for (const file of albumFiles) {
        if (file instanceof File) {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("aspectRatio", "original")
          const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
          if (!uploadResult.success) throw new Error(uploadResult.error || "Album picture upload failed")
          albumUrls.push(uploadResult.url)
        } else {
          // Preserve existing URLs if not uploading new files
          albumUrls.push(file)
        }
      }
    }

    console.log("Updating employee info with URLs:", { albumUrls })

    const employeeInfo = await prisma.employeeinfo.update({
      where: { employeeId },
      data: {
        managerId: data.managerId || null,
        album: albumUrls,
        region: data.region || null,
        nationality: data.nationality || null,
        note: data.note || null,
        maritalStatus: data.maritalStatus || "single",
        emergencyContact: data.emergencyContact || null,
        bloodType: data.bloodType || null,
        bankAccount: data.bankAccount || null,
        govId: data.govId || null,
        govExpire: data.govExpire ? new Date(data.govExpire) : null,
        terminationDate: data.terminationDate ? new Date(data.terminationDate) : null,
        contractType: mapContractType(data.contractType),
      },
    })

    const employee = await prisma.employee.findUnique({
      where: { employeeId },
      include: { Employeeinfo: true },
    })

    revalidatePath("/dashboard/employees")

    // Convert the employee data before returning
    const convertedEmployee = convertPrismaData(employee)
    return { success: true, employee: convertedEmployee }
  } catch (error) {
    console.error("Update employee info error:", error)
    return { success: false, error: error.message }
  }
}

export async function uploadEmployeeImages(employeeId, imageFiles) {
  try {
    console.log("Uploading employee images:", { employeeId, imageCount: imageFiles?.length || 0 })

    // Validate inputs
    if (!employeeId) {
      throw new Error("Employee ID is required")
    }

    if (!imageFiles || !Array.isArray(imageFiles) || imageFiles.length === 0) {
      throw new Error("No images provided for upload")
    }

    // Define valid image types from your Prisma enum
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
          employeeId,
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

    revalidatePath("/dashboard/employees")
    return { success: true, images: uploadedImages }
  } catch (error) {
    console.error("Employee images upload error:", error?.message)
    return { success: false, error: error?.message || "Failed to upload employee images" }
  }
}

export async function deleteEmployee(employeeId) {
  try {
    await prisma.employee.update({
      where: { employeeId },
      data: { status: "inactive" },
    })
    revalidatePath("/dashboard/employees")
    return { success: true }
  } catch (error) {
    console.error("Delete employee error:", error)
    return { success: false, error: error.message }
  }
}
