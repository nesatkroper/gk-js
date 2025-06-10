
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()

    const existingBrand = await prisma.brand.findUnique({ where: { brandId: id } })
    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    if (data.brandName === "") {
      return NextResponse.json({ error: "Brand name cannot be empty" }, { status: 400 })
    }

    const updatedBrand = await prisma.brand.update({
      where: { brandId: id },
      data: {
        brandName: data.brandName || undefined,
        brandCode: data.brandCode || null,
        picture: data.picture || null,
        memo: data.memo || null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedBrand)
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to update brand" }, { status: 500 })
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = params
    const existingBrand = await prisma.brand.findUnique({ where: { brandId: id } })
    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    await prisma.brand.delete({ where: { brandId: id } })
    return NextResponse.json({ message: "Brand deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete brand" }, { status: 500 })
  }
}