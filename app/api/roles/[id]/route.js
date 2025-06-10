import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    const existingRole = await prisma.role.findUnique({ where: { roleId: id } })
    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    if (existingRole.isSystemRole && !data.isSystemRole) {
      return NextResponse.json({ error: "Cannot unset system role flag" }, { status: 400 })
    }

    const role = await prisma.role.update({
      where: { roleId: id },
      data: {
        name: data.name,
        description: data.description || null,
        isSystemRole: data.isSystemRole,
      },
    })

    return NextResponse.json(role)
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "name"}` },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || "Failed to update role" },
      { status: 500 }
    )
  }
}


export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const existingRole = await prisma.role.findUnique({ where: { roleId: id } })
    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    if (existingRole.isSystemRole) {
      return NextResponse.json({ error: "Cannot delete system roles" }, { status: 400 })
    }

    await prisma.role.delete({ where: { roleId: id } })
    return NextResponse.json({ message: "Role deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete role" },
      { status: 500 }
    )
  }
}