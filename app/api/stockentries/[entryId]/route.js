import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    const { entryId } = params;
    const data = await request.json();

    const existingEntry = await prisma.entry.findUnique({
      where: { entryId },
      include: { Product: true },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Stock entry not found" }, { status: 404 });
    }

    const stockEntry = await prisma.$transaction(async (tx) => {
      // Calculate quantity difference
      const quantityDiff = data.quantity
        ? data.quantity - existingEntry.quantity
        : 0;

      // Update stock entry
      const updatedEntry = await tx.entry.update({
        where: { entryId },
        data: {
          productId: data.productId,
          supplierId: data.supplierId,
          quantity: data.quantity,
          entryPrice: data.entryPrice,
          entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
          invoice: data.invoice,
          memo: data.memo,
          status: data.status,
        },
        include: {
          Product: { select: { productId: true, productName: true, productCode: true } },
          Supplier: { select: { supplierId: true, supplierName: true } },
        },
      });

      // Update product quantity if quantity changed
      if (quantityDiff !== 0) {
        const product = await tx.product.findUnique({
          where: { productId: existingEntry.productId },
        });

        if (product) {
          await tx.product.update({
            where: { productId: existingEntry.productId },
            data: { quantity: product.quantity + quantityDiff },
          });
        }
      }

      return updatedEntry;
    });

    return NextResponse.json(stockEntry);
  } catch (error) {
    console.error("Stock entry update error:", error);
    return NextResponse.json({ error: "Failed to update stock entry" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { entryId } = params;

    const existingEntry = await prisma.entry.findUnique({
      where: { entryId },
      include: { Product: true },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Stock entry not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Update product quantity
      const product = await tx.product.findUnique({
        where: { productId: existingEntry.productId },
      });

      if (product) {
        await tx.product.update({
          where: { productId: existingEntry.productId },
          data: { quantity: product.quantity - existingEntry.quantity },
        });
      }

      // Delete stock entry
      await tx.entry.delete({
        where: { entryId },
      });
    });

    return NextResponse.json({ message: "Stock entry deleted successfully" });
  } catch (error) {
    console.error("Stock entry deletion error:", error);
    return NextResponse.json({ error: "Failed to delete stock entry" }, { status: 500 });
  }
}