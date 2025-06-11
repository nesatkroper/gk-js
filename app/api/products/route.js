import { NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import { generateProductCode } from "@/lib/utils"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("categoryId")

    const skip = (page - 1) * limit

    const where = {
      status: "active",
      ...(search && {
        OR: [
          { productName: { contains: search, mode: "insensitive" } },
          { productCode: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(categoryId && { categoryId }),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          Category: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    if (!data.productName || !data.categoryId)
      return NextResponse.json({ error: "Product name and category are required" }, { status: 400 })

    const productCode = data.productCode || generateProductCode()
    const product = await prisma.product.create({
      data: {
        productName: data.productName,
        productCode,
        categoryId: data.categoryId,
        picture: data.picture || null,
        unit: data.unit || null,
        capacity: data.capacity || null,
        sellPrice: data.sellPrice || 0,
        costPrice: data.costPrice || 0,
        discountRate: data.discountRate || 0,
        desc: data.desc || null,
        updatedAt: new Date(),
      },
      include: {
        Category: true,
      },
    })


    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

