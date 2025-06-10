import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { softDelete } from "@/lib/soft-delete"

export async function GET(request, { params }) {
  try {
    const department = await prisma.department.findUnique({
      where: { departmentId: params.id },
      include: {
        Employee: {
          include: {
            Position: true,
          },
        },
        Position: true,
        _count: {
          select: {
            Employee: true,
            Position: true,
          },
        },
      },
    })

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error("Department fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch department" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const department = await prisma.department.update({
      where: { departmentId: params.id },
      data: {
        departmentName: data.departmentName,
        departmentCode: data.departmentCode,
        memo: data.memo,
      },
      include: {
        _count: {
          select: {
            Employee: true,
            Position: true,
          },
        },
      },
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error("Department update error:", error)
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {

    const employeesCount = await prisma.employee.count({
      where: { departmentId: params.id, status: "active" },
    })

    if (employeesCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete department with active employees. Please reassign employees first." },
        { status: 400 },
      )
    }

    const department = await prisma.department.update({
      where: { departmentId: params.id },
      data: softDelete.delete,
    })

    return NextResponse.json({ message: "Department deleted successfully", department })
  } catch (error) {
    console.error("Department delete error:", error)
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 })
  }
}
