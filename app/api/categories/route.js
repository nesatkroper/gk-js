import {  NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import { generateCategoryCode } from "@/lib/utils"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { status: "active" },
      include: {
        _count: {
          select: { Product: true },
        },
      },
      orderBy: { categoryName: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Categories fetch error:", error.message)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    // Auto-generate category code if not provided
    const categoryCode = data.categoryCode || generateCategoryCode()

    const category = await prisma.category.create({
      data: {
        categoryName: data.categoryName,
        categoryCode,
        picture: data.picture,
        memo: data.memo,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Category creation error:", error.message)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
