import { NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      where: { status: "active" },
    })
    return NextResponse.json(brands)
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch brands" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    if (!data.brandName) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 })
    }

    const brand = await prisma.brand.create({
      data: {
        brandName: data.brandName,
        brandCode: data.brandCode || null,
        picture: data.picture || null,
        memo: data.memo || null,
        status: "active",
      },
    })

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to create brand" }, { status: 500 })
  }
}
