"use server"

import prisma from "@/lib/prisma"
import { uploadFileServerAction } from "@/app/actions/files"
import { revalidatePath } from "next/cache"
import { Decimal } from "@prisma/client"


function convertPrismaData(data) {
  try {
    if (data === null || data === undefined) return data

    if (Decimal.isDecimal?.(data)) return data.toNumber()

    if (data instanceof Date) return data.toISOString()

    if (Array.isArray(data)) return data.map(convertPrismaData)

    if (typeof data === "object") {
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, convertPrismaData(value)])
      )
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
          Employeeinfo: true,
          Sale: true,
          Attendance: true,
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
          Position: { select: { positionName: true } },
          Department: { select: { departmentName: true } },
          Employeeinfo: {
            select: {
              picture: true,
              managerId: true,
            },
          },
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

      console.log(employees);

      return convertPrismaData({ success: true, employees })
    }
  } catch (error) {
    console.error("Employees fetch error:", error)
    return { success: false, error: "Failed to fetch employees" }
  }
}

export async function createEmployee(data) {
  try {
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
        salary: parseFloat(data.salary) || 0,
        hiredDate: data.hiredDate ? new Date(data.hiredDate) : null,
        status: data.status || "active",
      },
    })
    revalidatePath("/dashboard/employees")
    return convertPrismaData({ success: true, employee })
  } catch (error) {
    console.error("Create employee error:", error)
    return { success: false, error: error.message }
  }
}

export async function updateEmployee(employeeId, data) {
  try {
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
        salary: parseFloat(data.salary) || 0,
        hiredDate: data.hiredDate ? new Date(data.hiredDate) : null,
        status: data.status || "active",
        updatedAt: new Date(),
      },
    })
    revalidatePath("/dashboard/employees")
    return convertPrismaData({ success: true, employee })
  } catch (error) {
    console.error("Update employee error:", error)
    return { success: false, error: error.message }
  }
}

export async function createEmployeeInfo(data, pictureFile, govFPictureFile, govBPictureFile, albumFiles) {
  let pictureUrl = data.picture || null
  let govFPictureUrl = data.govFPicture || null
  let govBPictureUrl = data.govBPicture || null
  let albumUrls = data.album || []

  try {
    // Handle single profile picture upload
    if (pictureFile && pictureFile instanceof File) {
      const formData = new FormData()
      formData.append("file", pictureFile)
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success) throw new Error(uploadResult.error || "Profile picture upload failed")
      pictureUrl = uploadResult.url
    }

    // Handle government ID front picture upload
    if (govFPictureFile && govFPictureFile instanceof File) {
      const formData = new FormData()
      formData.append("file", govFPictureFile)
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success) throw new Error(uploadResult.error || "Government ID front picture upload failed")
      govFPictureUrl = uploadResult.url
    }

    // Handle government ID back picture upload
    if (govBPictureFile && govBPictureFile instanceof File) {
      const formData = new FormData()
      formData.append("file", govBPictureFile)
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success) throw new Error(uploadResult.error || "Government ID back picture upload failed")
      govBPictureUrl = uploadResult.url
    }

    // Handle multiple album files upload
    if (albumFiles && Array.isArray(albumFiles) && albumFiles.length > 0) {
      albumUrls = []
      for (const file of albumFiles) {
        if (file instanceof File) {
          const formData = new FormData()
          formData.append("file", file)
          const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
          if (!uploadResult.success) throw new Error(uploadResult.error || "Album picture upload failed")
          albumUrls.push(uploadResult.url)
        }
      }
    }

    console.log("Creating employee info with URLs:", { pictureUrl, govFPictureUrl, govBPictureUrl, albumUrls })

    const employeeInfo = await prisma.employeeinfo.create({
      data: {
        employeeId: data.employeeId,
        managerId: data.managerId || null,
        picture: pictureUrl,
        govFPicture: govFPictureUrl,
        govBPicture: govBPictureUrl,
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
        status: data.status || "active",
      },
    })

    const employee = await prisma.employee.findUnique({
      where: { employeeId: data.employeeId },
      include: { Employeeinfo: true },
    })

    revalidatePath("/dashboard/employees")
    return convertPrismaData({ success: true, employee })
  } catch (error) {
    console.error("Create employee info error:", error)
    return { success: false, error: error.message }
  }
}

export async function updateEmployeeInfo(employeeId, data, pictureFile, govFPictureFile, govBPictureFile, albumFiles) {
  let pictureUrl = data.picture || null
  let govFPictureUrl = data.govFPicture || null
  let govBPictureUrl = data.govBPicture || null
  let albumUrls = data.album || []

  try {
    // Handle single profile picture upload
    if (pictureFile && pictureFile instanceof File) {
      const formData = new FormData()
      formData.append("file", pictureFile)
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success) throw new Error(uploadResult.error || "Profile picture upload failed")
      pictureUrl = uploadResult.url
    }

    // Handle government ID front picture upload
    if (govFPictureFile && govFPictureFile instanceof File) {
      const formData = new FormData()
      formData.append("file", govFPictureFile)
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success) throw new Error(uploadResult.error || "Government ID front picture upload failed")
      govFPictureUrl = uploadResult.url
    }

    // Handle government ID back picture upload
    if (govBPictureFile && govBPictureFile instanceof File) {
      const formData = new FormData()
      formData.append("file", govBPictureFile)
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success) throw new Error(uploadResult.error || "Government ID back picture upload failed")
      govBPictureUrl = uploadResult.url
    }

    // Handle multiple album files upload
    if (albumFiles && Array.isArray(albumFiles) && albumFiles.length > 0) {
      albumUrls = []
      for (const file of albumFiles) {
        if (file instanceof File) {
          const formData = new FormData()
          formData.append("file", file)
          const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
          if (!uploadResult.success) throw new Error(uploadResult.error || "Album picture upload failed")
          albumUrls.push(uploadResult.url)
        } else {
          // Preserve existing URLs if not uploading new files
          albumUrls.push(file)
        }
      }
    }

    console.log("Updating employee info with URLs:", { pictureUrl, govFPictureUrl, govBPictureUrl, albumUrls })

    const employeeInfo = await prisma.employeeinfo.update({
      where: { employeeId },
      data: {
        managerId: data.managerId || null,
        picture: pictureUrl,
        govFPicture: govFPictureUrl,
        govBPicture: govBPictureUrl,
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
        status: data.status || "active",
      },
    })

    const employee = await prisma.employee.findUnique({
      where: { employeeId },
      include: { Employeeinfo: true },
    })

    revalidatePath("/dashboard/employees")
    return convertPrismaData({ success: true, employee })
  } catch (error) {
    console.error("Update employee info error:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteEmployee(employeeId) {
  try {
    await prisma.employee.delete({
      where: { employeeId },
    })
    revalidatePath("/dashboard/employees")
    return { success: true }
  } catch (error) {
    console.error("Delete employee error:", error)
    return { success: false, error: error.message }
  }
}

