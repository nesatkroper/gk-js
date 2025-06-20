"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Decimal } from "@prisma/client/runtime/library"

function convertPrismaData(obj) {
  if (obj === null || obj === undefined) return obj

  if (Array.isArray(obj))
    return obj.map(convertPrismaData)

  if (typeof obj === "object") {
    if (obj instanceof Decimal)
      return obj.toNumber()

    if (obj instanceof Date)
      return obj.toISOString()

    if (typeof obj === "bigint")
      return obj.toString()

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertPrismaData(value)])
    )
  }

  return obj
}

export async function getSales() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        Branch: { select: { branchName: true } },
        Customer: { select: { firstName: true, lastName: true } },
        Employee: { select: { firstName: true, lastName: true } },
        Saledetail: {
          include: { Product: { select: { productName: true, sellPrice: true } } },
        },
      },
      orderBy: { saleDate: "desc" },
    })

    const convertedSales = convertPrismaData(sales)
    return { success: true, sales: convertedSales }
  } catch (error) {
    console.error("Sales fetch error:", error)
    return { success: false, error: "Failed to fetch sales" }
  }
}

export async function createSale(data) {
  try {
    const { customerId, branchId, employeeId, saleDate, items, memo, invoice } = data

    const sale = await prisma.sale.create({
      data: {
        customerId,
        branchId,
        employeeId,
        saleDate: new Date(saleDate),
        amount: new Decimal(data.amount || 0).toNumber(), 
        status: data.status || "active",
        memo,
        invoice,
        createdAt: new Date(),
        updatedAt: new Date(),
        Saledetail: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            amount: new Decimal(item.amount || 0).toNumber(),
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        },
      },
    })

    revalidatePath("/sales")
    const convertedSale = convertPrismaData(sale)
    return { success: true, sale: convertedSale }
  } catch (error) {
    console.error("Sale creation error:", error)
    return { success: false, error: error.message || "Failed to create sale" }
  }
}

export async function updateSale(saleId, data) {
  try {
    const { customerId, branchId, employeeId, saleDate, items, memo, invoice, amount, status } = data

    const sale = await prisma.sale.update({
      where: { saleId },
      data: {
        customerId,
        branchId,
        employeeId,
        saleDate: new Date(saleDate),
        amount: new Decimal(amount || 0).toNumber(),
        status: status || "active",
        memo,
        invoice,
        updatedAt: new Date(),
        Saledetail: {
          deleteMany: {}, 
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            amount: new Decimal(item.amount || 0).toNumber(),
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        },
      },
    })

    revalidatePath("/sales")
    const convertedSale = convertPrismaData(sale)
    return { success: true, sale: convertedSale }
  } catch (error) {
    console.error("Sale update error:", error)
    return { success: false, error: error.message || "Failed to update sale" }
  }
}

export async function deleteSale(saleId) {
  try {
    await prisma.sale.update({
      where: { saleId },
      data: { status: "inactive" },
    })
    revalidatePath("/sales")
    return { success: true }
  } catch (error) {
    console.error("Sale deletion error:", error)
    return { success: false, error: error.message || "Failed to delete sale" }
  }
}