"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { uploadFileServerAction } from "@/app/actions/files"
import { generateEmployeeCode } from "@/lib/utils"

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
    const employeeCode = generateEmployeeCode()

    const employee = await prisma.employee.create({
      data: {
        employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        phone: data.phone || null,
        email: data.email || null,
        departmentId: data.departmentId,
        positionId: data.positionId,
        branchId: data.branchId || null, // Handle branchId
        salary: parseFloat(data.salary), // Ensure salary is a number
        dob: data.dob ? new Date(data.dob) : null,
        hiredDate: data.hiredDate ? new Date(data.hiredDate) : null,
        status: data.status || "active",
      },
    })

    revalidatePath("/employees")
    return { success: true, employee: {
      ...employee,
      salary: employee.salary.toNumber(), // Serialize Decimal
      dob: employee.dob ? employee.dob.toISOString() : null,
      hiredDate: employee.hiredDate ? employee.hiredDate.toISOString() : null,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    } }
  } catch (error) {
    console.error("Employee creation error:", error?.message)
    return { success: false, error: error?.message || "Failed to create employee" }
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
        gender: data.gender,
        phone: data.phone || null,
        email: data.email || null,
        departmentId: data.departmentId,
        positionId: data.positionId,
        branchId: data.branchId || null, // Handle branchId
        salary: parseFloat(data.salary), // Ensure salary is a number
        dob: data.dob ? new Date(data.dob) : null,
        hiredDate: data.hiredDate ? new Date(data.hiredDate) : null,
        status: data.status || "active",
      },
    })

    revalidatePath("/employees")
    return { success: true, employee: {
      ...employee,
      salary: employee.salary.toNumber(), // Serialize Decimal
      dob: employee.dob ? employee.dob.toISOString() : null,
      hiredDate: employee.hiredDate ? employee.hiredDate.toISOString() : null,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    } }
  } catch (error) {
    console.error("Employee update error:", error?.message)
    return { success: false, error: error?.message || "Failed to update employee" }
  }
}

export async function createEmployeeInfo(data, file) {
  try {
    console.log("Creating employee info with:", {
      data,
      hasFile: !!file,
      fileType: file?.type,
      fileName: file?.name,
    })

    let pictureUrl = null

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

    console.log("Creating employee info with picture URL:", pictureUrl)

    const employeeInfo = await prisma.employeeinfo.create({
      data: {
        employeeId: data.employeeId,
        managerId: data.managerId || null,
        picture: pictureUrl,
        region: data.region || null,
        nationality: data.nationality || null,
        note: data.note || null,
        maritalStatus: data.maritalStatus || "single",
        emergencyContact: data.emergencyContact || null,
        bloodType: data.bloodType || null,
        bankAccount: data.bankAccount || null,
        govId: data.govId || null,
        govExpire: data.govExpire ? new Date(data.govExpire) : null,
        contractType: data.contractType || "fulltime",
        status: data.status || "active",
      },
    })

    revalidatePath("/employees")
    return { success: true, employeeInfo: {
      ...employeeInfo,
      govExpire: employeeInfo.govExpire ? employeeInfo.govExpire.toISOString() : null,
    } }
  } catch (error) {
    console.error("Employee info creation error:", error?.message)
    return { success: false, error: error?.message || "Failed to create employee info" }
  }
}

export async function updateEmployeeInfo(employeeId, data, file) {
  try {
    console.log("Updating employee info with:", {
      employeeId,
      data,
      hasFile: !!file,
      fileType: file?.type,
      fileName: file?.name,
    })

    const currentEmployeeInfo = await prisma.employeeinfo.findUnique({
      where: { employeeId },
      select: { picture: true },
    })

    let pictureUrl = currentEmployeeInfo?.picture || null

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

    console.log("Updating employee info with picture URL:", pictureUrl)

    const employeeInfo = await prisma.employeeinfo.update({
      where: { employeeId },
      data: {
        managerId: data.managerId || null,
        picture: pictureUrl,
        region: data.region || null,
        nationality: data.nationality || null,
        note: data.note || null,
        maritalStatus: data.maritalStatus || "single",
        emergencyContact: data.emergencyContact || null,
        bloodType: data.bloodType || null,
        bankAccount: data.bankAccount || null,
        govId: data.govId || null,
        govExpire: data.govExpire ? new Date(data.govExpire) : null,
        contractType: data.contractType || "fulltime",
        status: data.status || "active",
      },
    })

    revalidatePath("/employees")
    return { success: true, employeeInfo: {
      ...employeeInfo,
      govExpire: employeeInfo.govExpire ? employeeInfo.govExpire.toISOString() : null,
    } }
  } catch (error) {
    console.error("Employee info update error:", error?.message)
    return { success: false, error: error?.message || "Failed to update employee info" }
  }
}

export async function deleteEmployee(employeeId) {
  try {
    await prisma.employee.update({
      where: { employeeId },
      data: { status: "inactive" },
    })
    revalidatePath("/employees")
    return { success: true }
  } catch (error) {
    console.error("Employee deletion error:", error?.message)
    return { success: false, error: error?.message || "Failed to delete employee" }
  }
}

// 'use server'

// import prisma from '@/lib/prisma'
// import { z } from 'zod'
// import { revalidatePath } from 'next/cache'
// import { Status, Gender, MaritalStatus, ContractType } from '@prisma/client'

// const employeeCoreSchema = z.object({
//   firstName: z.string().min(1, 'First name is required').max(100),
//   lastName: z.string().min(1, 'Last name is required').max(100),
//   positionId: z.string().uuid('Invalid position ID'),
//   departmentId: z.string().uuid('Invalid department ID'),
//   salary: z.number().min(0, 'Salary must be non-negative'),
//   status: z.enum([Status.active, Status.inactive]).default(Status.active),
//   employeeCode: z.string().max(50).optional(),
//   phone: z.string().max(20).optional(),
//   email: z.string().email().max(100).optional(),
//   dob: z.date().optional(),
//   hiredDate: z.date().optional(),
//   gender: z.enum([Gender.male, Gender.female]).default(Gender.male),
//   branchId: z.string().uuid('Invalid branch ID').optional(),
// })

// const employeeInfoSchema = z.object({
//   employeeId: z.string().uuid('Invalid employee ID'),
//   managerId: z.string().uuid('Invalid manager ID').optional(),
//   picture: z.string().url().optional(),
//   region: z.string().max(100).optional(),
//   nationality: z.string().max(100).optional(),
//   note: z.string().optional(),
//   maritalStatus: z.enum([MaritalStatus.single, MaritalStatus.married]).default(MaritalStatus.single),
//   emergencyContact: z.string().max(100).optional(),
//   bloodType: z.string().max(10).optional(),
//   bankAccount: z.string().max(50).optional(),
//   govExpire: z.date().optional(),
//   govId: z.string().max(50).optional(),
//   govPicture: z.string().url().optional(),
//   terminationDate: z.date().optional(),
//   contractType: z.enum([ContractType.fulltime, ContractType.parttime, ContractType.contract]),
//   status: z.enum([Status.active, Status.inactive]).default(Status.active),
// })

// export async function createEmployee(data) {
//   try {
//     const validatedData = employeeCoreSchema.parse({
//       ...data,
//       salary: parseFloat(data.salary),
//       dob: data.dob ? new Date(data.dob) : undefined,
//       hiredDate: data.hiredDate ? new Date(data.hiredDate) : undefined,
//     })

//     const employee = await prisma.employee.create({
//       data: {
//         ...validatedData,
//         updatedAt: new Date(),
//       },
//       include: {
//         Position: true,
//         Department: true,
//         Branch: true,
//         Employeeinfo: true,
//       },
//     })

//     revalidatePath('/dashboard/employees')
//     return { success: true, employee, error: null }
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return { success: false, error: error.errors.map((err) => err.message).join(', '), employee: null }
//     }
//     if (error.code === 'P2002') {
//       return { success: false, error: `Unique constraint failed: ${error.meta.target.join(', ')}`, employee: null }
//     }
//     return { success: false, error: 'Failed to create employee: ' + error.message, employee: null }
//   }
// }

// export async function updateEmployee(employeeId, data) {
//   try {
//     const validatedData = employeeCoreSchema.partial().parse({
//       ...data,
//       salary: data.salary ? parseFloat(data.salary) : undefined,
//       dob: data.dob ? new Date(data.dob) : undefined,
//       hiredDate: data.hiredDate ? new Date(data.hiredDate) : undefined,
//     })

//     const employee = await prisma.employee.update({
//       where: { employeeId },
//       data: {
//         ...validatedData,
//         updatedAt: new Date(),
//       },
//       include: {
//         Position: true,
//         Department: true,
//         Branch: true,
//         Employeeinfo: true,
//       },
//     })

//     revalidatePath('/dashboard/employees')
//     return { success: true, employee, error: null }
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return { success: false, error: error.errors.map((err) => err.message).join(', '), employee: null }
//     }
//     if (error.code === 'P2002') {
//       return { success: false, error: `Unique constraint failed: ${error.meta.target.join(', ')}`, employee: null }
//     }
//     return { success: false, error: 'Failed to update employee: ' + error.message, employee: null }
//   }
// }

// export async function createEmployeeInfo(data) {
//   try {
//     const validatedData = employeeInfoSchema.parse({
//       ...data,
//       govExpire: data.govExpire ? new Date(data.govExpire) : undefined,
//       terminationDate: data.terminationDate ? new Date(data.terminationDate) : undefined,
//     })

//     const employeeInfo = await prisma.employeeinfo.create({
//       data: {
//         ...validatedData,
//       },
//     })

//     revalidatePath('/dashboard/employees')
//     return { success: true, employeeInfo, error: null }
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return { success: false, error: error.errors.map((err) => err.message).join(', '), employeeInfo: null }
//     }
//     return { success: false, error: 'Failed to create employee info: ' + error.message, employeeInfo: null }
//   }
// }

// export async function updateEmployeeInfo(employeeId, data) {
//   try {
//     const validatedData = employeeInfoSchema.partial().parse({
//       ...data,
//       employeeId,
//       govExpire: data.govExpire ? new Date(data.govExpire) : undefined,
//       terminationDate: data.terminationDate ? new Date(data.terminationDate) : undefined,
//     })

//     const employeeInfo = await prisma.employeeinfo.update({
//       where: { employeeId },
//       data: {
//         ...validatedData,
//       },
//     })

//     revalidatePath('/dashboard/employees')
//     return { success: true, employeeInfo, error: null }
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return { success: false, error: error.errors.map((err) => err.message).join(', '), employeeInfo: null }
//     }
//     return { success: false, error: 'Failed to update employee info: ' + error.message, employeeInfo: null }
//   }
// }

// export async function deleteEmployee(employeeId) {
//   try {
//     const employee = await prisma.employee.findUnique({
//       where: { employeeId },
//       include: {
//         Attendance: true,
//         Sale: true,
//         LeaveRequest_LeaveRequest_employeeIdToEmployee: true,
//       },
//     })

//     if (!employee) {
//       return { success: false, error: 'Employee not found', employee: null }
//     }

//     if (
//       employee.Attendance.length > 0 ||
//       employee.Sale.length > 0 ||
//       employee.LeaveRequest_LeaveRequest_employeeIdToEmployee.length > 0
//     ) {
//       return { success: false, error: 'Cannot delete employee with related records', employee: null }
//     }

//     const deletedEmployee = await prisma.employee.delete({
//       where: { employeeId },
//     })

//     revalidatePath('/dashboard/employees')
//     return { success: true, employee: deletedEmployee, error: null }
//   } catch (error) {
//     return { success: false, error: 'Failed to delete employee: ' + error.message, employee: null }
//   }
// }

// export async function getEmployee(employeeId) {
//   try {
//     const employee = await prisma.employee.findUnique({
//       where: { employeeId },
//       include: {
//         Position: true,
//         Department: true,
//         Branch: true,
//         Employeeinfo: true,
//         Address: true,
//       },
//     })

//     if (!employee) {
//       return { success: false, error: 'Employee not found', employee: null }
//     }

//     return { success: true, employee, error: null }
//   } catch (error) {
//     return { success: false, error: 'Failed to fetch employee: ' + error.message, employee: null }
//   }
// }

// export async function getAllEmployees() {
//   try {
//     const employees = await prisma.employee.findMany({
//       include: {
//         Position: true,
//         Department: true,
//         Branch: true,
//         Employeeinfo: true,
//         Address: true,
//       },
//     })

//     return { success: true, employees, error: null }
//   } catch (error) {
//     return { success: false, error: 'Failed to fetch employees: ' + error.message, employees: null }
//   }
// }