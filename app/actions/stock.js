"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Helper to serialize Stock data
function serializeStock(stock) {
  return {
    ...stock,
    createdAt: stock.createdAt.toISOString(),
    updatedAt: stock.updatedAt.toISOString(),
  }
}

export async function createStock(data) {
  try {
    const stock = await prisma.stock.create({
      data: {
        productId: data.productId,
        branchId: data.branchId,
        quantity: parseInt(data.quantity) || 0,
        unit: data.unit || "unit",
        memo: data.memo || null,
      },
      include: {
        Product: true,
        Branch: true,
      },
    })
    revalidatePath("/dashboard/inventory")
    return { success: true, stock: serializeStock(stock) }
  } catch (error) {
    console.error("Create stock error:", error)
    return { success: false, error: error.message }
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
      include: {
        Product: true,
        Branch: true,
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


// // actions/stock.ts
// "use server";

// import prisma from "@/lib/prisma";
// import { revalidatePath } from "next/cache";



// export async function fetchStockEntries(params) {
//   try {
//     const { search = "", lowStock = false } = params;
//     const entries = await prisma.entry.findMany({
//       where: {
//         status: "active",
//         ...(search && {
//           OR: [
//             { Product: { productName: { contains: search, mode: "insensitive" } } },
//             { Product: { productCode: { contains: search, mode: "insensitive" } } },
//             { invoice: { contains: search, mode: "insensitive" } },
//             { memo: { contains: search, mode: "insensitive" } },
//           ],
//         }),
//         ...(lowStock && { quantity: { lt: 50 } }),
//       },
//       include: {
//         Product: {
//           include: {
//             Category: { select: { categoryName: true } },
//           },
//         },
//         Supplier: true,
//         Branch: true,
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     // Serialize Decimal field
//     const serializedEntries = entries.map((entry) => ({
//       ...entry,
//       entryPrice: entry.entryPrice.toNumber(),
//       entryDate: entry.entryDate ? entry.entryDate.toISOString() : null,
//       createdAt: entry.createdAt.toISOString(),
//       updatedAt: entry.updatedAt.toISOString(),
//     }));

//     return { success: true, data: serializedEntries };
//   } catch (error) {
//     console.error("Stock fetch error:", error.message);
//     return { success: false, error: "Failed to fetch stock entries" };
//   }
// }

// export async function createStockEntry(data) {
//   try {
//     const entry = await prisma.entry.create({
//       data: {
//         productId: data.productId,
//         supplierId: data.supplierId,
//         branchId: data.branchId || "default-branch-id", // Replace with actual default branch ID
//         quantity: data.quantity,
//         entryPrice: parseFloat(data.entryPrice),
//         entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
//         invoice: data.invoice,
//         memo: data.memo,
//         status: data.status || "active",
//       },
//     });

//     // Update Stock table
//     await prisma.stock.upsert({
//       where: {
//         productId_branchId: {
//           productId: data.productId,
//           branchId: data.branchId || "default-branch-id",
//         },
//       },
//       update: {
//         quantity: { increment: data.quantity },
//         updatedAt: new Date(),
//       },
//       create: {
//         productId: data.productId,
//         branchId: data.branchId || "default-branch-id",
//         quantity: data.quantity,
//         unit: (await prisma.product.findUnique({ where: { productId: data.productId } }))?.unit || "",
//         memo: data.memo || "",
//       },
//     });

//     revalidatePath("/inventory");
//     return {
//       success: true, data: {
//         ...entry,
//         entryPrice: entry.entryPrice.toNumber(),
//         entryDate: entry.entryDate ? entry.entryDate.toISOString() : null,
//         createdAt: entry.createdAt.toISOString(),
//         updatedAt: entry.updatedAt.toISOString(),
//       }
//     };
//   } catch (error) {
//     console.error("Stock creation error:", error.message);
//     return { success: false, error: error.message || "Failed to create stock entry" };
//   }
// }

// export async function updateStockEntry(entryId, data) {
//   try {
//     const existingEntry = await prisma.entry.findUnique({ where: { entryId } });
//     if (!existingEntry) {
//       throw new Error("Stock entry not found");
//     }

//     const entry = await prisma.entry.update({
//       where: { entryId },
//       data: {
//         productId: data.productId,
//         supplierId: data.supplierId,
//         branchId: data.branchId || existingEntry.branchId,
//         quantity: data.quantity,
//         entryPrice: data.entryPrice ? parseFloat(data.entryPrice) : undefined,
//         entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
//         invoice: data.invoice,
//         memo: data.memo,
//         status: data.status,
//         updatedAt: new Date(),
//       },
//     });

//     // Update Stock table
//     if (data.quantity !== undefined && data.quantity !== existingEntry.quantity) {
//       const quantityDiff = data.quantity - existingEntry.quantity;
//       await prisma.stock.update({
//         where: {
//           productId_branchId: {
//             productId: entry.productId,
//             branchId: entry.branchId,
//           },
//         },
//         data: {
//           quantity: { increment: quantityDiff },
//           updatedAt: new Date(),
//         },
//       });
//     }

//     revalidatePath("/inventory");
//     return {
//       success: true, data: {
//         ...entry,
//         entryPrice: entry.entryPrice.toNumber(),
//         entryDate: entry.entryDate ? entry.entryDate.toISOString() : null,
//         createdAt: entry.createdAt.toISOString(),
//         updatedAt: entry.updatedAt.toISOString(),
//       }
//     };
//   } catch (error) {
//     console.error("Stock update error:", error.message);
//     return { success: false, error: error.message || "Failed to update stock entry" };
//   }
// }

// export async function deleteStockEntry(entryId) {
//   try {
//     const entry = await prisma.entry.findUnique({ where: { entryId } });
//     if (!entry) {
//       throw new Error("Stock entry not found");
//     }

//     await prisma.entry.update({
//       where: { entryId },
//       data: { status: "inactive" },
//     });

//     // Update Stock table
//     await prisma.stock.update({
//       where: {
//         productId_branchId: {
//           productId: entry.productId,
//           branchId: entry.branchId,
//         },
//       },
//       data: {
//         quantity: { decrement: entry.quantity },
//         updatedAt: new Date(),
//       },
//     });

//     revalidatePath("/inventory");
//     return { success: true };
//   } catch (error) {
//     console.error("Stock deletion error:", error.message);
//     return { success: false, error: "Failed to delete stock entry" };
//   }
// }