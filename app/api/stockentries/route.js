import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const lowStock = searchParams.get("lowStock") === "true";

    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { memo: { contains: search, mode: "insensitive" } },
          { invoice: { contains: search, mode: "insensitive" } },
          {
            Product: {
              OR: [
                { productName: { contains: search, mode: "insensitive" } },
                { productCode: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ],
      }),
      status: "active",
      ...(lowStock && { quantity: { lt: 50 } }),
    };

    const [stockEntries, total] = await prisma.$transaction([
      prisma.entry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          Product: { select: { productId: true, productName: true, productCode: true } },
          Supplier: { select: { supplierId: true, supplierName: true } },
        },
      }),
      prisma.entry.count({ where }),
    ]);

    return NextResponse.json({
      stockEntries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Stock entries fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch stock entries" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const stockEntry = await prisma.$transaction(async (tx) => {
      // Create stock entry
      const entry = await tx.entry.create({
        data: {
          productId: data.productId,
          supplierId: data.supplierId,
          quantity: data.quantity,
          entryPrice: data.entryPrice,
          entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
          invoice: data.invoice,
          memo: data.memo,
          status: data.status || "active",
        },
        include: {
          Product: { select: { productId: true, productName: true, productCode: true } },
          Supplier: { select: { supplierId: true, supplierName: true } },
        },
      });

      // Update product quantity
      const product = await tx.product.findUnique({
        where: { productId: data.productId },
      });

      if (product) {
        await tx.product.update({
          where: { productId: data.productId },
          data: { quantity: product.quantity + data.quantity },
        });
      } else {
        throw new Error("Product not found");
      }

      return entry;
    });

    return NextResponse.json(stockEntry, { status: 201 });
  } catch (error) {
    console.error("Stock entry creation error:", error);
    return NextResponse.json({ error: "Failed to create stock entry" }, { status: 500 });
  }
}