import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { softDelete } from "@/lib/soft-delete"

export async function GET(request, { params }) {
  try {
    const category = await prisma.category.findUnique({
      where: { categoryId: params.id },
      include: {
        Product: {
          include: {
            Stock: true,
          },
        },
        _count: {
          select: {
            Product: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Category fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()
    const { id } = await params

    const existing = await prisma.category.findUnique({
      where: { categoryId: id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }


    const category = await prisma.category.update({
      where: { categoryId: id },
      data: {
        categoryName: data.categoryName,
        categoryCode: data.categoryCode,
        picture: data.picture,
        memo: data.memo,
      },
      include: {
        _count: {
          select: {
            Product: true,
          },
        },
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Category update error:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const productsCount = await prisma.product.count({
      where: { categoryId: id, status: "active" },
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with active products. Please reassign or delete products first." },
        { status: 400 },
      )
    }

    const category = await prisma.category.update({
      where: { categoryId: id },
      data: softDelete.delete,
    })

    return NextResponse.json({ message: "Category deleted successfully", category })
  } catch (error) {
    console.error("Category delete error:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
