"use server";

import prisma from "@/lib/prisma";
import { softDeleteWhere } from "@/lib/soft-delete";
import { revalidatePath } from "next/cache";

function serializeData(obj) {
  if (!obj) return obj;
  const newObj = { ...obj };
  for (const key in newObj) {
    if (newObj[key] instanceof Date) {
      newObj[key] = newObj[key].toISOString();
    } else if (typeof newObj[key] === "object") {
      newObj[key] = serializeData(newObj[key]);
    }
  }
  return newObj;
}

export async function getSuppliers({ page = 1, limit = 10, search = "", includeInactive = false } = {}) {
  try {
    const skip = (page - 1) * limit;
    const where = {
      ...(includeInactive ? {} : softDeleteWhere.active),
      ...(search && {
        OR: [
          { supplierName: { contains: search, mode: "insensitive" } },
          { companyName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          _count: {
            select: {
              Entry: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.supplier.count({ where }),
    ]);

    const serializedSuppliers = suppliers.map(serializeData);
    return {
      data: {
        suppliers: serializedSuppliers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Suppliers fetch error:", error);
    return { error: error.message || "Failed to fetch suppliers" };
  }
}

export async function createSupplier(data) {
  try {
    if (!data.supplierName) throw new Error("Supplier name is required");
    const supplier = await prisma.supplier.create({
      data: {
        supplierName: data.supplierName,
        companyName: data.companyName || null,
        phone: data.phone || null,
        email: data.email || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    revalidatePath("/suppliers");
    return { data: serializeData(supplier) };
  } catch (error) {
    console.error("Supplier creation error:", error);
    if (error.code === "P2002") {
      return { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` };
    }
    return { error: error.message || "Failed to create supplier" };
  }
}

export async function updateSupplier(supplierId, data) {
  try {
    if (!supplierId) throw new Error("Supplier ID is required");
    const supplier = await prisma.supplier.update({
      where: { supplierId },
      data: {
        supplierName: data.supplierName,
        companyName: data.companyName || null,
        phone: data.phone || null,
        email: data.email || null,
        updatedAt: new Date(),
      },
    });
    revalidatePath("/suppliers");
    return { data: serializeData(supplier) };
  } catch (error) {
    console.error("Supplier update error:", error);
    if (error.code === "P2025") {
      return { error: "Supplier not found" };
    }
    return { error: error.message || "Failed to update supplier" };
  }
}

export async function deleteSupplier(supplierId) {
  try {
    if (!supplierId) throw new Error("Supplier ID is required");
    const supplier = await prisma.supplier.update({
      where: { supplierId },
      data: { deletedAt: new Date(), updatedAt: new Date() },
    });
    revalidatePath("/suppliers");
    return { data: serializeData(supplier) };
  } catch (error) {
    console.error("Supplier soft delete error:", error);
    if (error.code === "P2025") {
      return { error: "Supplier not found" };
    }
    return { error: error.message || "Failed to soft delete supplier" };
  }
}
