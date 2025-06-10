import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()

    const existingEmployee = await prisma.employee.findUnique({ where: { employeeId: id } })
    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    if (data.firstName === "" || data.lastName === "") {
      return NextResponse.json({ error: "First and last name cannot be empty" }, { status: 400 })
    }

    if (data.positionId) {
      const position = await prisma.position.findUnique({ where: { positionId: data.positionId } })
      if (!position) return NextResponse.json({ error: "Position not found" }, { status: 404 })
    }

    if (data.departmentId) {
      const department = await prisma.department.findUnique({ where: { departmentId: data.departmentId } })
      if (!department) return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    if (data.branchId) {
      const branch = await prisma.branch.findUnique({ where: { branchId: data.branchId } })
      if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    const updatedEmployee = await prisma.employee.update({
      where: { employeeId: id },
      data: {
        employeeCode: data.employeeCode !== undefined ? data.employeeCode : undefined,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        gender: data.gender || undefined,
        dob: data.dob !== undefined ? (data.dob ? new Date(data.dob) : null) : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        positionId: data.positionId || undefined,
        branchId: data.branchId !== undefined ? data.branchId : undefined,
        departmentId: data.departmentId || undefined,
        salary: data.salary !== undefined ? data.salary : undefined,
        hiredDate: data.hiredDate !== undefined ? (data.hiredDate ? new Date(data.hiredDate) : null) : undefined,
        updatedAt: new Date(),
      },
      include: {
        Department: { select: { departmentId: true, departmentName: true } },
        Position: { select: { positionId: true, positionName: true } },
        Branch: { select: { branchId: true, branchName: true } },
      },
    })

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to update employee" }, { status: 500 })
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = params
    const existingEmployee = await prisma.employee.findUnique({ where: { employeeId: id } })
    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    await prisma.employee.delete({ where: { employeeId: id } })
    return NextResponse.json({ message: "Employee deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete employee" }, { status: 500 })
  }
}