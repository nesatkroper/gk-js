import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      where: { status: "active" },
      include: {
        Employee: { select: { employeeId: true, firstName: true, lastName: true } },
        Customer: { select: { customerId: true, firstName: true, lastName: true } },
        Saledetail: {
          include: {
            Product: true
          }
        },
      },
      orderBy: { "createdAt": "desc" }
    })
    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Validation
    if (!data.employeeId || !data.customerId || !data.amount || !data.items) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Create transaction
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Create Sale
      const sale = await prisma.sale.create({
        data: {
          employeeId: data.employeeId,
          customerId: data.customerId,
          branchId: data.branchId,
          saleDate: data.saleDate ? new Date(data.saleDate) : new Date(),
          amount: data.amount,
          invoice: data.invoice || null,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        },
      });

      // 2. Create all Saledetail records
      const saleDetails = await Promise.all(
        data.items.map((item) =>
          prisma.saledetail.create({
            data: {
              saleId: sale.saleId,
              productId: item.productId,
              quantity: item.quantity,
              amount: item.amount, // quantity * price
              status: "active",
              createdAt: new Date(),
              updatedAt: new Date()
            },
          })
        )
      );

      return { sale, saleDetails };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create sale" },
      { status: 500 }
    );
  }
}