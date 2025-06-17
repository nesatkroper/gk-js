


"use server"

import  prisma  from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { uploadFileServerAction } from "@/app/actions/files" 
import { Decimal } from "@prisma/client"

function convertDecimals(obj) {
  if (obj instanceof Decimal) {
    return obj.toString()
  } else if (Array.isArray(obj)) {
    return obj.map(convertDecimals)
  } else if (obj !== null && typeof obj === "object") {
    const newObj = {}
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        newObj[key] = convertDecimals(obj[key])
      }
    }
    return newObj
  }
  return obj
}

function serializeStock(stock) {
  return convertDecimals({
    ...stock,
    createdAt: stock.createdAt.toISOString(),
    updatedAt: stock.updatedAt.toISOString(),
  })
}

function serializeEntry(entry) {
  return convertDecimals({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    entryDate: entry.entryDate?.toISOString() || null,
    entryPrice: entry.entryPrice.toString(),
  })
}


export async function createEntryAndUpdateStock(data, file) {
  try {
    // Upload invoice image
    let invoiceUrl = null
    if (file && file instanceof File) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("aspectRatio", "original")

      const uploadResult = await uploadFileServerAction(formData, { maxSizeMB: 5 })

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Invoice upload failed")
      }

      invoiceUrl = uploadResult.url
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { productId: data.productId }
      })
      if (!product) throw new Error("Product not found")
      if (!data.branchId) throw new Error("Branch must be specified")

      const branch = await tx.branch.findUnique({
        where: { branchId: data.branchId }
      })
      if (!branch) throw new Error("Branch not found")

      if (data.supplierId) {
        const supplier = await tx.supplier.findUnique({
          where: { supplierId: data.supplierId }
        })
        if (!supplier) throw new Error("Supplier not found")
      }

      const entry = await tx.entry.create({
        data: {
          quantity: parseInt(data.quantity) || 0,
          entryPrice: parseFloat(data.entryPrice) || 0.0,
          memo: data.memo || 'N/A',
          invoice: invoiceUrl, // Use image URL
          entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
          status: data.status || "active",
          createdAt: new Date(),
          updatedAt: new Date(),
          Product: { connect: { productId: data.productId } },
          ...(data.supplierId && {
            Supplier: { connect: { supplierId: data.supplierId } }
          }),
          Branch: { connect: { branchId: data.branchId } }
        }
      })

      const quantity = parseInt(data.quantity) || 0
      const unit = data.unit || product.unit || "unit"
      const now = new Date()

      const stock = await tx.stock.upsert({
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
          memo: data.memo || "N/A",
          Product: { connect: { productId: data.productId } },
          Branch: { connect: { branchId: data.branchId } },
          createdAt: now,
          updatedAt: now
        }
      })

      return { entry, stock }
    })

    revalidatePath("/dashboard/inventory")

    return {
      success: true,
      entry: serializeEntry(result.entry),
      stock: result.stock ? serializeStock(result.stock) : null
    }
  } catch (error) {
    console.error("Create entry error:", error)
    return {
      success: false,
      error: error.message || "Failed to create entry"
    }
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
