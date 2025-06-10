import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const groupBy = searchParams.get("groupBy") || "day"

    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        saleDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }
    }

    // Sales summary
    const salesSummary = await prisma.sale.aggregate({
      where: { status: "active", ...dateFilter },
      _sum: { amount: true },
      _count: true,
      _avg: { amount: true },
    })

    // Top products
    const topProducts = await prisma.saledetail.groupBy({
      by: ["productId"],
      where: {
        sale: { status: "active", ...dateFilter },
      },
      _sum: { quantity: true, amount: true },
      _count: true,
      orderBy: { _sum: { amount: "desc" } },
      take: 10,
    })

    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { productId: item.productId },
          select: { productName: true, productCode: true },
        })
        return {
          ...item,
          product,
        }
      }),
    )

    // Top customers
    const topCustomers = await prisma.sale.groupBy({
      by: ["customerId"],
      where: { status: "active", ...dateFilter },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: "desc" } },
      take: 10,
    })

    const customersWithDetails = await Promise.all(
      topCustomers.map(async (item) => {
        const customer = await prisma.customer.findUnique({
          where: { customerId: item.customerId },
          select: { firstName: true, lastName: true },
        })
        return {
          ...item,
          customer,
        }
      }),
    )

    // Sales by employee
    const salesByEmployee = await prisma.sale.groupBy({
      by: ["employeeId"],
      where: { status: "active", ...dateFilter },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: "desc" } },
    })

    const employeesWithDetails = await Promise.all(
      salesByEmployee.map(async (item) => {
        const employee = await prisma.employee.findUnique({
          where: { employeeId: item.employeeId },
          select: { firstName: true, lastName: true, department: true },
        })
        return {
          ...item,
          employee,
        }
      }),
    )

    return NextResponse.json({
      summary: salesSummary,
      topProducts: productsWithDetails,
      topCustomers: customersWithDetails,
      salesByEmployee: employeesWithDetails,
    })
  } catch (error) {
    console.error("Sales report error:", error)
    return NextResponse.json({ error: "Failed to generate sales report" }, { status: 500 })
  }
}
