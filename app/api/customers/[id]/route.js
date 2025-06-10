import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { softDelete } from "@/lib/soft-delete"

export async function GET(request, { params }) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { customerId: params.id },
      include: {
        address: {
          include: {
            city: true,
            state: true,
          },
        },
        info: true,
        employee: true,
        sales: {
          include: {
            saledetails: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Customer fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const customer = await prisma.$transaction(async (tx) => {
      // Update customer
      const updatedCustomer = await tx.customer.update({
        where: { customerId: params.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          phone: data.phone,
          employeeId: data.employeeId,
        },
      })

      // Update or create customer info
      if (data.email || data.region || data.note || data.govId) {
        await tx.customerinfo.upsert({
          where: { customerId: params.id },
          update: {
            email: data.email,
            region: data.region,
            note: data.note,
            govId: data.govId,
            govExpire: data.govExpire ? new Date(data.govExpire) : null,
          },
          create: {
            customerId: params.id,
            email: data.email,
            region: data.region,
            note: data.note,
            govId: data.govId,
            govExpire: data.govExpire ? new Date(data.govExpire) : null,
          },
        })
      }

      return updatedCustomer
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Customer update error:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const customer = await prisma.customer.update({
      where: { customerId: params.id },
      data: softDelete.delete,
    })

    return NextResponse.json({ message: "Customer deleted successfully", customer })
  } catch (error) {
    console.error("Customer delete error:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
