import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()

    const existingPayment = await prisma.payment.findUnique({ where: { paymentId: id } })
    if (!existingPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (data.employeeId) {
      const employee = await prisma.employee.findUnique({ where: { employeeId: data.employeeId } })
      if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    if (data.saleId) {
      const sale = await prisma.sale.findUnique({ where: { saleId: data.saleId } })
      if (!sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    const updatedPayment = await prisma.payment.update({
      where: { paymentId: id },
      data: {
        employeeId: data.employeeId || undefined,
        saleId: data.saleId || undefined,
        invoice: data.invoice !== undefined ? data.invoice : undefined,
        hash: data.hash !== undefined ? data.hash : undefined,
        fromAccountId: data.fromAccountId || undefined,
        toAccountId: data.toAccountId || undefined,
        currency: data.currency || undefined,
        amount: data.amount !== undefined ? data.amount : undefined,
        externalRef: data.externalRef || undefined,
        updatedAt: new Date(),
      },
      include: {
        Employee: { select: { employeeId: true, firstName: true, lastName: true } },
        Sale: { select: { saleId: true, saleDate: true } },
      },
    })

    return NextResponse.json(updatedPayment)
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to update payment" }, { status: 500 })
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = params
    const existingPayment = await prisma.payment.findUnique({ where: { paymentId: id } })
    if (!existingPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    await prisma.payment.delete({ where: { paymentId: id } })
    return NextResponse.json({ message: "Payment deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete payment" }, { status: 500 })
  }
}