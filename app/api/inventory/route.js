import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const lowStock = searchParams.get("lowStock") === "true"

    const skip = (page - 1) * limit

    const where = {
      product: {
        status: "active",
        ...(search && {
          OR: [
            { productName: { contains: search, mode: "insensitive" } },
            { productCode: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      ...(lowStock && { quantity: { lt: 50 } }),
    }

    return NextResponse.json({

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Inventory fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const stockEntry = await prisma.$transaction(async (tx) => {
      // Create stock entry
      const entry = await tx.stockentry.create({
        data: {
          productId: data.productId,
          supplierId: data.supplierId,
          quantity: data.quantity,
          entryPrice: data.entryPrice,
          entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
          invoice: data.invoice,
          memo: data.memo,
        },
      })

      // Update stock quantity
      const existingStock = await tx.stock.findUnique({
        where: { productId: data.productId },
      })

      if (existingStock) {
        await tx.stock.update({
          where: { productId: data.productId },
          data: { quantity: existingStock.quantity + data.quantity },
        })
      } else {
        await tx.stock.create({
          data: {
            productId: data.productId,
            quantity: data.quantity,
          },
        })
      }

      return entry
    })

    return NextResponse.json(stockEntry, { status: 201 })
  } catch (error) {
    console.error("Stock entry creation error:", error)
    return NextResponse.json({ error: "Failed to create stock entry" }, { status: 500 })
  }
}
