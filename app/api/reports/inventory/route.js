import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Stock levels
    const stockLevels = await prisma.product.findMany({
      include: {
        Category: true,
      },
      orderBy: { quantity: "asc" },
    })

    // Low stock items (less than 50)
    const lowStockItems = stockLevels.filter((stock) => stock.quantity < 50)

    // Out of stock items
    const outOfStockItems = stockLevels.filter((stock) => stock.quantity === 0)

    // Stock by category
    const stockByCategory = await prisma.product.groupBy({
      by: ["categoryId"],
      _sum: { quantity: true },
    })

    // Recent stock entries
    const recentEntries = await prisma.entry.findMany({
      include: {
        product: true,
        supplier: true,
      },
      orderBy: { entryDate: "desc" },
      take: 20,
    })

    // Stock value calculation
    const stockValue = await prisma.stock.findMany({
      include: {
        product: {
          select: {
            costPrice: true,
            sellPrice: true,
          },
        },
      },
    })

    const totalCostValue = stockValue.reduce((sum, stock) => sum + stock.quantity * (stock.product.costPrice || 0), 0)

    const totalSellValue = stockValue.reduce((sum, stock) => sum + stock.quantity * (stock.product.sellPrice || 0), 0)

    return NextResponse.json({
      stockLevels,
      lowStockItems,
      outOfStockItems,
      recentEntries,
      summary: {
        totalProducts: stockLevels.length,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        totalCostValue,
        totalSellValue,
        potentialProfit: totalSellValue - totalCostValue,
      },
    })
  } catch (error) {
    console.error("Inventory report error:", error)
    return NextResponse.json({ error: "Failed to generate inventory report" }, { status: 500 })
  }
}
