"use server"

import  prisma  from "@/lib/prisma"
import { revalidatePath } from "next/cache"

function serializeStock(stock) {
  return {
    ...stock,
    createdAt: stock.createdAt.toISOString(),
    updatedAt: stock.updatedAt.toISOString(),
  }
}

function serializeEntry(entry) {
  return {
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    entryDate: entry.entryDate ? entry.entryDate.toISOString() : null,
    entryPrice: entry.entryPrice.toString(),
  }
}

export async function createEntryAndUpdateStock(data) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Validate required relations
      const product = await tx.product.findUnique({ 
        where: { productId: data.productId } 
      });
      if (!product) throw new Error("Product not found");

      // Validate optional relations if IDs are provided
      const [branch, supplier, customer] = await Promise.all([
        data.branchId ? tx.branch.findUnique({ where: { branchId: data.branchId } }) : null,
        data.supplierId ? tx.supplier.findUnique({ where: { supplierId: data.supplierId } }) : null,
        data.customerId ? tx.customer.findUnique({ where: { customerId: data.customerId } }) : null
      ]);

      if (data.branchId && !branch) throw new Error("Branch not found");
      if (data.supplierId && !supplier) throw new Error("Supplier not found");
      if (data.customerId && !customer) throw new Error("Customer not found");

      // Prepare entry data with conditional relations
      const entryData = {
        quantity: parseInt(data.quantity) || 0,
        entryPrice: parseFloat(data.entryPrice) || 0.00,
        memo: data.memo || null,
        invoice: data.invoice || null,
        entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
        status: data.status || 'active',
        Product: { connect: { productId: data.productId } },
        ...(data.branchId && { 
          Branch: { connect: { branchId: data.branchId } } 
        }),
        ...(data.supplierId && { 
          Supplier: { connect: { supplierId: data.supplierId } } 
        }),
        ...(data.customerId && { 
          Customer: { connect: { customerId: data.customerId } } 
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const entry = await tx.entry.create({
        data: entryData
      });

      // Only update stock if branchId is provided
      let stock = null;
      if (data.branchId) {
        stock = await tx.stock.upsert({
          where: {
            productId_branchId: {
              productId: data.productId,
              branchId: data.branchId,
            },
          },
          update: {
            quantity: { increment: parseInt(data.quantity) || 0 },
            updatedAt: new Date(),
          },
          create: {
            quantity: parseInt(data.quantity) || 0,
            unit: data.unit || product.unit || "unit",
            memo: data.memo || null,
            Branch: { connect: { branchId: data.branchId } },
            Product: { connect: { productId: data.productId } },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      return { entry, stock };
    });

    revalidatePath("/dashboard/inventory");
    return { 
      success: true, 
      entry: serializeEntry(result.entry),
      stock: result.stock ? serializeStock(result.stock) : null
    };
  } catch (error) {
    console.error("Create entry and update stock error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to create entry and update stock"
    };
  }
}

export async function updateStock(stockId, data) {
  try {
    const stock = await prisma.stock.update({
      where: { stockId },
      data: {
        productId: data.productId,
        branchId: data.branchId,
        quantity: parseInt(data.quantity) || 0,
        unit: data.unit || "unit",
        memo: data.memo || null,
        updatedAt: new Date(),
      },
    })
    revalidatePath("/dashboard/inventory")
    return { success: true, stock: serializeStock(stock) }
  } catch (error) {
    console.error("Update stock error:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteStock(stockId) {
  try {
    await prisma.stock.delete({
      where: { stockId },
    })
    revalidatePath("/dashboard/inventory")
    return { success: true }
  } catch (error) {
    console.error("Delete stock error:", error)
    return { success: false, error: error.message }
  }
}

export async function fetchStocks({ search = "", lowStock = false } = {}) {
  try {
    const stocks = await prisma.stock.findMany({
      where: {
        AND: [
          lowStock ? { quantity: { lt: 50 } } : {},
          search
            ? {
                OR: [
                  { Product: { productName: { contains: search, mode: "insensitive" } } },
                  { Product: { productCode: { contains: search, mode: "insensitive" } } },
                  { memo: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      include: {
        Product: { include: { Category: true } },
        Branch: true,
      },
    })
    return { success: true, stocks: stocks.map(serializeStock) }
  } catch (error) {
    console.error("Fetch stocks error:", error)
    return { success: false, error: error.message }
  }
}
