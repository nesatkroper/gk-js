"use server"

import prisma from "@/lib/prisma"
import { uploadFileServerAction } from "@/app/actions/files"
import { revalidatePath } from "next/cache"

// Helper to serialize Decimal and Date fields
function serializeEmployee(employee) {
  return {
    ...employee,
    salary: parseFloat(employee.salary),
    dob: employee.dob ? employee.dob.toISOString() : null,
    hiredDate: employee.hiredDate ? employee.hiredDate.toISOString() : null,
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
    Employeeinfo: employee.Employeeinfo
      ? {
        ...employee.Employeeinfo,
        govExpire: employee.Employeeinfo.govExpire ? employee.Employeeinfo.govExpire.toISOString() : null,
        terminationDate: employee.Employeeinfo.terminationDate ? employee.Employeeinfo.terminationDate.toISOString() : null,
      }
      : null,
  }
}

// Map form contract types to Prisma ContractType enum
function mapContractType(formContractType) {
  const contractTypeMap = {
    fulltime: "permanent",
    parttime: "temporary",
    contract: "contract",
    intern: "intern",
  }
  return contractTypeMap[formContractType] || "permanent" // Default to permanent if invalid
}


export async function getAllEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        Department: { select: { departmentName: true } },
        Position: { select: { positionName: true } },
        Employeeinfo: true,
        Sale: true,
        Attendance: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Serialize Decimal fields to plain numbers
    const serializedEmployees = employees.map((employee) => ({
      ...employee,
      salary: employee.salary.toNumber(), // Convert Decimal to number
      dob: employee.dob ? employee.dob.toISOString() : null,
      hiredDate: employee.hiredDate ? employee.hiredDate.toISOString() : null,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
      Employeeinfo: employee.Employeeinfo
        ? {
          ...employee.Employeeinfo,
          govExpire: employee.Employeeinfo.govExpire
            ? employee.Employeeinfo.govExpire.toISOString()
            : null,
        }
        : null,
    }))

    return { success: true, employees: serializedEmployees }
  } catch (error) {
    console.error("Employees fetch error:", error?.message)
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
    return { success: true, employee: serializeEmployee(employee) }
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
    return { success: true, employee: serializeEmployee(employee) }
  } catch (error) {
    console.error("Update employee error:", error)
    return { success: false, error: error.message }
  }
}

export async function createEmployeeInfo(data, pictureFile, govPictureFile) {
  let pictureUrl = data.picture || null
  let govPictureUrl = data.govPicture || null

  try {
    if (pictureFile && pictureFile instanceof File) {
      const formData = new FormData()
      formData.append("file", pictureFile)
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success) throw new Error(uploadResult.error || "File upload failed")
      pictureUrl = uploadResult.url
    }

    if (govPictureFile && govPictureFile instanceof File) {
      const formData = new FormData()
      formData.append("file", govPictureFile)
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success) throw new Error(uploadResult.error || "File upload failed")
      govPictureUrl = uploadResult.url
    }

    console.log("Creating employee info with URLs:", { pictureUrl, govPictureUrl })

    const employeeInfo = await prisma.employeeinfo.create({
      data: {
        employeeId: data.employeeId,
        managerId: data.managerId || null,
        picture: pictureUrl,
        govPicture: govPictureUrl,
        region: data.region || null,
        nationality: data.nationality || null,
        note: data.note || null,
        maritalStatus: data.maritalStatus || "single",
        emergencyContact: data.emergencyContact || null,
        bloodType: data.bloodType || null,
        bankAccount: data.bankAccount || null,
        govId: data.govId || null,
        govExpire: data.govExpire ? new Date(data.govExpire) : null,
        contractType: mapContractType(data.contractType),
        status: data.status || "active",
      },
    })

    const employee = await prisma.employee.findUnique({
      where: { employeeId: data.employeeId },
      include: { Employeeinfo: true },
    })

    revalidatePath("/dashboard/employees")
    return { success: true, employee: serializeEmployee(employee) }
  } catch (error) {
    console.error("Create employee info error:", error)
    return { success: false, error: error.message }
  }
}

export async function updateEmployeeInfo(employeeId, data, pictureFile, govPictureFile) {
  let pictureUrl = data.picture || null
  let govPictureUrl = data.govPicture || null

  try {
    if (pictureFile && pictureFile instanceof File) {
      const formData = new FormData()
      formData.append("file", pictureFile)
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success) throw new Error(uploadResult.error || "File upload failed")
      pictureUrl = uploadResult.url
    }

    if (govPictureFile && govPictureFile instanceof File) {
      const formData = new FormData()
      formData.append("file", govPictureFile)
      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })
      if (!uploadResult.success) throw new Error(uploadResult.error || "File upload failed")
      govPictureUrl = uploadResult.url
    }

    console.log("Updating employee info with URLs:", { pictureUrl, govPictureUrl })

    const employeeInfo = await prisma.employeeinfo.update({
      where: { employeeId },
      data: {
        managerId: data.managerId || null,
        picture: pictureUrl,
        govPicture: govPictureUrl,
        region: data.region || null,
        nationality: data.nationality || null,
        note: data.note || null,
        maritalStatus: data.maritalStatus || "single",
        emergencyContact: data.emergencyContact || null,
        bloodType: data.bloodType || null,
        bankAccount: data.bankAccount || null,
        govId: data.govId || null,
        govExpire: data.govExpire ? new Date(data.govExpire) : null,
        contractType: mapContractType(data.contractType),
        status: data.status || "active",
      },
    })

    const employee = await prisma.employee.findUnique({
      where: { employeeId },
      include: { Employeeinfo: true },
    })

    revalidatePath("/dashboard/employees")
    return { success: true, employee: serializeEmployee(employee) }
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

