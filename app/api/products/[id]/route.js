import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({

      where: { productId: id },
      include: {
        Category: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Product fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()
    const { id } = await params

    const product = await prisma.product.update({
      where: { productId: id },
      data: {
        productName: data.productName,
        productCode: data.productCode,
        categoryId: data.categoryId,
        picture: data.picture,
        unit: data.unit,
        capacity: data.capacity,
        sellPrice: data.sellPrice,
        costPrice: data.costPrice,
        discountRate: data.discountRate,
        desc: data.desc,
        updatedAt: new Date(),
      },
      include: {
        Category: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const product = await prisma.product.update({
      where: { productId: id },
      data: {
        status: "inactive",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Product delete error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
