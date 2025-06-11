import { NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import { softDeleteWhere } from "@/lib/soft-delete"
import { generateDepartmentCode } from "@/lib/utils"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"

    const departments = await prisma.department.findMany({
      where: includeInactive ? {} : softDeleteWhere.active,
      include: {
        _count: {
          select: {
            Employee: true,
            Position: true,
          },
        },
      },
      orderBy: { departmentName: "asc" },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error("Departments fetch error:", error.message)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const departmentCode = generateDepartmentCode()

    const department = await prisma.department.create({
      data: {
        departmentName: data.departmentName,
        departmentCode,
        memo: data.memo,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error("Department creation error:", error.message)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}
