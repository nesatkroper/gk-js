import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()

    const existingSale = await prisma.sale.findUnique({ where: { saleId: id } })
    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    if (data.employeeId) {
      const employee = await prisma.employee.findUnique({ where: { employeeId: data.employeeId } })
      if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    if (data.customerId) {
      const customer = await prisma.customer.findUnique({ where: { customerId: data.customerId } })
      if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const updatedSale = await prisma.sale.update({
      where: { saleId: id },
      data: {
        employeeId: data.employeeId || undefined,
        customerId: data.customerId || undefined,
        saleDate: data.saleDate ? new Date(data.saleDate) : undefined,
        amount: data.amount !== undefined ? data.amount : undefined,
        memo: data.memo !== undefined ? data.memo : undefined,
        invoice: data.invoice !== undefined ? data.invoice : undefined,
        updatedAt: new Date(),
      },
      include: {
        Employee: { select: { employeeId: true, firstName: true, lastName: true } },
        Customer: { select: { customerId: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(updatedSale)
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to update sale" }, { status: 500 })
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = params
    const existingSale = await prisma.sale.findUnique({ where: { saleId: id } })
    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    await prisma.sale.delete({ where: { saleId: id } })
    return NextResponse.json({ message: "Sale deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete sale" }, { status: 500 })
  }
}