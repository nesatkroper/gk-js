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



// "use server"

// import prisma from "@/lib/prisma"
// import { revalidatePath } from "next/cache"
// import { uploadFileServerAction } from "@/app/actions/files"
// import { generateEmployeeCode } from "@/lib/utils"


// export async function createEmployee(data) {
//   try {
//     const employeeCode = generateEmployeeCode()

//     const employee = await prisma.employee.create({
//       data: {
//         employeeCode,
//         firstName: data.firstName,
//         lastName: data.lastName,
//         gender: data.gender,
//         phone: data.phone || null,
//         email: data.email || null,
//         departmentId: data.departmentId,
//         positionId: data.positionId,
//         branchId: data.branchId || null, // Handle branchId
//         salary: parseFloat(data.salary), // Ensure salary is a number
//         dob: data.dob ? new Date(data.dob) : null,
//         hiredDate: data.hiredDate ? new Date(data.hiredDate) : null,
//         status: data.status || "active",
//       },
//     })

//     revalidatePath("/employees")
//     return { success: true, employee: {
//       ...employee,
//       salary: employee.salary.toNumber(), // Serialize Decimal
//       dob: employee.dob ? employee.dob.toISOString() : null,
//       hiredDate: employee.hiredDate ? employee.hiredDate.toISOString() : null,
//       createdAt: employee.createdAt.toISOString(),
//       updatedAt: employee.updatedAt.toISOString(),
//     } }
//   } catch (error) {
//     console.error("Employee creation error:", error?.message)
//     return { success: false, error: error?.message || "Failed to create employee" }
//   }
// }

// export async function updateEmployee(employeeId, data) {
//   try {
//     const employee = await prisma.employee.update({
//       where: { employeeId },
//       data: {
//         employeeCode: data.employeeCode || null,
//         firstName: data.firstName,
//         lastName: data.lastName,
//         gender: data.gender,
//         phone: data.phone || null,
//         email: data.email || null,
//         departmentId: data.departmentId,
//         positionId: data.positionId,
//         branchId: data.branchId || null, // Handle branchId
//         salary: parseFloat(data.salary), // Ensure salary is a number
//         dob: data.dob ? new Date(data.dob) : null,
//         hiredDate: data.hiredDate ? new Date(data.hiredDate) : null,
//         status: data.status || "active",
//       },
//     })

//     revalidatePath("/employees")
//     return { success: true, employee: {
//       ...employee,
//       salary: employee.salary.toNumber(), // Serialize Decimal
//       dob: employee.dob ? employee.dob.toISOString() : null,
//       hiredDate: employee.hiredDate ? employee.hiredDate.toISOString() : null,
//       createdAt: employee.createdAt.toISOString(),
//       updatedAt: employee.updatedAt.toISOString(),
//     } }
//   } catch (error) {
//     console.error("Employee update error:", error?.message)
//     return { success: false, error: error?.message || "Failed to update employee" }
//   }
// }

// export async function createEmployeeInfo(data, file) {
//   try {
//     console.log("Creating employee info with:", {
//       data,
//       hasFile: !!file,
//       fileType: file?.type,
//       fileName: file?.name,
//     })

//     let pictureUrl = null

//     if (file && file instanceof File) {
//       console.log("Uploading file:", file.name)

//       const formData = new FormData()
//       formData.append("file", file)
//       formData.append("aspectRatio", "original")

//       const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })

//       console.log("Upload result:", uploadResult)

//       if (!uploadResult.success || !uploadResult.url) {
//         throw new Error(uploadResult.error || "File upload failed")
//       }
//       pictureUrl = uploadResult.url
//     }

//     console.log("Creating employee info with picture URL:", pictureUrl)

//     const employeeInfo = await prisma.employeeinfo.create({
//       data: {
//         employeeId: data.employeeId,
//         managerId: data.managerId || null,
//         picture: pictureUrl,
//         region: data.region || null,
//         nationality: data.nationality || null,
//         note: data.note || null,
//         maritalStatus: data.maritalStatus || "single",
//         emergencyContact: data.emergencyContact || null,
//         bloodType: data.bloodType || null,
//         bankAccount: data.bankAccount || null,
//         govId: data.govId || null,
//         govExpire: data.govExpire ? new Date(data.govExpire) : null,
//         contractType: data.contractType || "fulltime",
//         status: data.status || "active",
//       },
//     })

//     revalidatePath("/employees")
//     return { success: true, employeeInfo: {
//       ...employeeInfo,
//       govExpire: employeeInfo.govExpire ? employeeInfo.govExpire.toISOString() : null,
//     } }
//   } catch (error) {
//     console.error("Employee info creation error:", error?.message)
//     return { success: false, error: error?.message || "Failed to create employee info" }
//   }
// }

// export async function updateEmployeeInfo(employeeId, data, file) {
//   try {
//     console.log("Updating employee info with:", {
//       employeeId,
//       data,
//       hasFile: !!file,
//       fileType: file?.type,
//       fileName: file?.name,
//     })

//     const currentEmployeeInfo = await prisma.employeeinfo.findUnique({
//       where: { employeeId },
//       select: { picture: true },
//     })

//     let pictureUrl = currentEmployeeInfo?.picture || null

//     if (file && file instanceof File) {
//       console.log("Uploading new file:", file.name)

//       const formData = new FormData()
//       formData.append("file", file)
//       formData.append("aspectRatio", "original")

//       const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })

//       console.log("Upload result:", uploadResult)

//       if (!uploadResult.success || !uploadResult.url) {
//         throw new Error(uploadResult.error || "File upload failed")
//       }
//       pictureUrl = uploadResult.url
//     }

//     console.log("Updating employee info with picture URL:", pictureUrl)

//     const employeeInfo = await prisma.employeeinfo.update({
//       where: { employeeId },
//       data: {
//         managerId: data.managerId || null,
//         picture: pictureUrl,
//         region: data.region || null,
//         nationality: data.nationality || null,
//         note: data.note || null,
//         maritalStatus: data.maritalStatus || "single",
//         emergencyContact: data.emergencyContact || null,
//         bloodType: data.bloodType || null,
//         bankAccount: data.bankAccount || null,
//         govId: data.govId || null,
//         govExpire: data.govExpire ? new Date(data.govExpire) : null,
//         contractType: data.contractType || "fulltime",
//         status: data.status || "active",
//       },
//     })

//     revalidatePath("/employees")
//     return { success: true, employeeInfo: {
//       ...employeeInfo,
//       govExpire: employeeInfo.govExpire ? employeeInfo.govExpire.toISOString() : null,
//     } }
//   } catch (error) {
//     console.error("Employee info update error:", error?.message)
//     return { success: false, error: error?.message || "Failed to update employee info" }
//   }
// }

// export async function deleteEmployee(employeeId) {
//   try {
//     await prisma.employee.update({
//       where: { employeeId },
//       data: { status: "inactive" },
//     })
//     revalidatePath("/employees")
//     return { success: true }
//   } catch (error) {
//     console.error("Employee deletion error:", error?.message)
//     return { success: false, error: error?.message || "Failed to delete employee" }
//   }
// }
