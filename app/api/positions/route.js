import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { softDeleteWhere } from "@/lib/soft-delete"
import { generatePositionCode } from "@/lib/utils"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get("departmentId")
    const includeInactive = searchParams.get("includeInactive") === "true"

    const where = {
      ...(includeInactive ? {} : softDeleteWhere.active),
      ...(departmentId && { departmentId }),
    }

    const positions = await prisma.position.findMany({
      where,
      include: {
        Department: true,
        _count: {
          select: {
            Employee: true,
          },
        },
      },
      orderBy: { positionName: "asc" },
    })

    return NextResponse.json(positions)
  } catch (error) {
    console.error("Positions fetch error:", error.message)
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const positionCode = data.positionCode || generatePositionCode()

    const position = await prisma.position.create({
      data: {
        departmentId: data.departmentId,
        positionName: data.positionName,
        positionCode,
        memo: data.memo,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        Department: true,
      },
    })

    return NextResponse.json(position, { status: 201 })
  } catch (error) {
    console.error("Position creation error:", error.message)
    return NextResponse.json({ error: "Failed to create position" }, { status: 500 })
  }
}
