import { NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import { softDelete } from "@/lib/soft-delete"

export async function GET(request, { params }) {
  try {
    const position = await prisma.position.findUnique({
      where: { positionId: params.id },
      include: {
        department: true,
        employees: {
          include: {
            info: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
    })

    if (!position) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 })
    }

    return NextResponse.json(position)
  } catch (error) {
    console.error("Position fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch position" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const position = await prisma.position.update({
      where: { positionId: params.id },
      data: {
        positionName: data.positionName,
        positionCode: data.positionCode,
        departmentId: data.departmentId,
        memo: data.memo,
      },
      include: {
        department: true,
        _count: {
          select: {
            employees: true,
          },
        },
      },
    })

    return NextResponse.json(position)
  } catch (error) {
    console.error("Position update error:", error)
    return NextResponse.json({ error: "Failed to update position" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check if position has employees
    const employeesCount = await prisma.employee.count({
      where: { positionId: params.id, status: "active" },
    })

    if (employeesCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete position with active employees. Please reassign employees first." },
        { status: 400 },
      )
    }

    const position = await prisma.position.update({
      where: { positionId: params.id },
      data: softDelete.delete,
    })

    return NextResponse.json({ message: "Position deleted successfully", position })
  } catch (error) {
    console.error("Position delete error:", error)
    return NextResponse.json({ error: "Failed to delete position" }, { status: 500 })
  }
}
