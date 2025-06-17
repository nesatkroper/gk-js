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
  console.log(data)
  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { productId: data.productId }
      });
      if (!product) throw new Error("Product not found");
      if (!data.branchId && !data.customerId) {
        throw new Error("Either branch or customer must be specified");
      }
      if (data.branchId && data.customerId) {
        throw new Error("Cannot specify both branch and customer");
      }

      if (data.branchId) {
        const branch = await tx.branch.findUnique({
          where: { branchId: data.branchId }
        });
        if (!branch) throw new Error("Branch not found");
      } else {
        const customer = await tx.customer.findUnique({
          where: { customerId: data.customerId }
        });
        if (!customer) throw new Error("Customer not found");
      }

      if (data.supplierId) {
        const supplier = await tx.supplier.findUnique({
          where: { supplierId: data.supplierId }
        });
        if (!supplier) throw new Error("Supplier not found");
      }

      const entry = await tx.entry.create({
        data: {
          quantity: parseInt(data.quantity) || 0,
          entryPrice: parseFloat(data.entryPrice) || 0.0,
          memo: data.memo || null,
          invoice: data.invoice || null,
          entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
          status: data.status || "active",
          createdAt: new Date(),
          updatedAt: new Date(),
          Product: { connect: { productId: data.productId } },
          ...(data.supplierId && {
            Supplier: { connect: { supplierId: data.supplierId } }
          }),
          ...(data.branchId
            ? { Branch: { connect: { branchId: data.branchId } } }
            : { Customer: { connect: { customerId: data.customerId } } })
        }
      });

      let stock = null;
      const quantity = parseInt(data.quantity) || 0;
      const unit = data.unit || product.unit || "unit";
      const now = new Date();

      if (data.branchId) {
        stock = await tx.stock.upsert({
          where: {
            productId_branchId: {
              productId: data.productId,
              branchId: data.branchId
            }
          },
          update: {
            quantity: { increment: quantity },
            updatedAt: now
          },
          create: {
            quantity,
            unit,
            memo: data.memo || null,
            Product: { connect: { productId: data.productId } },
            Branch: { connect: { branchId: data.branchId } },
            createdAt: now,
            updatedAt: now
          }
        });
      } else if (data.customerId) {
        stock = await tx.stock.upsert({
          where: {
            productId_customerId: {
              productId: data.productId,
              customerId: data.customerId
            }
          },
          update: {
            quantity: { increment: quantity },
            updatedAt: now
          },
          create: {
            quantity,
            unit,
            memo: data.memo || null,
            Product: { connect: { productId: data.productId } },
            Customer: { connect: { customerId: data.customerId } },
            createdAt: now,
            updatedAt: now
          }
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
    console.error("Create entry error:", error);
    return {
      success: false,
      error: error.message || "Failed to create entry"
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
