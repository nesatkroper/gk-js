import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    const existingBranch = await prisma.branch.findUnique({ where: { branchId: id } })
    if (!existingBranch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    if (data.branchName === "") {
      return NextResponse.json({ error: "Branch name cannot be empty" }, { status: 400 })
    }

    const updatedBranch = await prisma.branch.update({
      where: { branchId: id },
      data: {
        branchName: data.branchName || undefined,
        branchCode: data.branchCode || null,
        picture: data.picture || null,
        tel: data.tel || null,
        memo: data.memo || null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedBranch)
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to update branch" }, { status: 500 })
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = params
    const existingBranch = await prisma.branch.findUnique({ where: { branchId: id } })
    if (!existingBranch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    await prisma.branch.delete({ where: { branchId: id } })
    return NextResponse.json({ message: "Branch deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete branch" }, { status: 500 })
  }
}