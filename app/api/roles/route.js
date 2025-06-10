import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      where: { status: "active" },
    })
    return NextResponse.json(roles)
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch roles" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    if (!data.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description || null,
        isSystemRole: data.isSystemRole || false,
        status: "active",
      },
    })

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "name"}` },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || "Failed to create role" },
      { status: 500 }
    )
  }
}