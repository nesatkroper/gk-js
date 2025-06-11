


import { NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import { softDeleteWhere } from "@/lib/soft-delete"
import { generateEmployeeCode } from "@/lib/utils"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const departmentId = searchParams.get("departmentId")
    const includeInactive = searchParams.get("includeInactive") === "true"

    const skip = (page - 1) * limit

    const where = {
      ...(includeInactive ? {} : softDeleteWhere.active),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { employeeCode: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(departmentId && { departmentId }),
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          Department: true,
          Position: true,
          Employeeinfo: true,
          Address: true,
          _count: {
            select: {
              Sale: true,
              Attendance: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.count({ where }),
    ])

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Employees fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const employee = await prisma.$transaction(async (tx) => {
      const employeeCode = generateEmployeeCode()
      const newEmployee = await tx.employee.create({
        data: {
          employeeCode,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender || "male",
          dob: data.dob ? new Date(data.dob) : null,
          phone: data.phone,
          positionId: data.positionId,
          departmentId: data.departmentId,
          salary: data.salary,
          hiredDate: data.hiredDate ? new Date(data.hiredDate) : null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      })

      if (data.email || data.region || data.note) {
        await tx.employeeinfo.create({
          data: {
            employeeId: newEmployee.employeeId,
            email: data.email,
            region: data.region,
            note: data.note,
            govId: data.govId,
            govExpire: data.govExpire ? new Date(data.govExpire) : null,
          },
        })
      }

      return newEmployee
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error("Employee creation error:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}

