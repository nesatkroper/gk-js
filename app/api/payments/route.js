

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      where: { status: "active" },
      include: {
        Employee: { select: { employeeId: true, firstName: true, lastName: true } },
        Sale: { select: { saleId: true, saleDate: true } },
      },
    })
    return NextResponse.json(payments)
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    if (!data.employeeId || !data.saleId || !data.fromAccountId || !data.toAccountId || !data.currency || !data.amount || !data.externalRef) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    const employee = await prisma.employee.findUnique({ where: { employeeId: data.employeeId } })
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 })

    const sale = await prisma.sale.findUnique({ where: { saleId: data.saleId } })
    if (!sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 })

    const payment = await prisma.payment.create({
      data: {
        employeeId: data.employeeId,
        saleId: data.saleId,
        invoice: data.invoice || null,
        hash: data.hash || null,
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        currency: data.currency,
        amount: data.amount,
        externalRef: data.externalRef,
        status: "active",
      },
      include: {
        Employee: { select: { employeeId: true, firstName: true, lastName: true } },
        Sale: { select: { saleId: true, saleDate: true } },
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to create payment" }, { status: 500 })
  }
}


// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const page = Number.parseInt(searchParams.get("page") || "1")
//     const limit = Number.parseInt(searchParams.get("limit") || "10")
//     const type = searchParams.get("type")
//     const status = searchParams.get("status")

//     const skip = (page - 1) * limit

//     const where = {}
//     if (type) where.type = type
//     if (status) where.status = status

//     const [payments, total] = await Promise.all([
//       prisma.payment.findMany({
//         where,
//         include: {
//           sale: {
//             include: {
//               customer: true,
//             },
//           },
//         },
//         skip,
//         take: limit,
//         orderBy: { createdAt: "desc" },
//       }),
//       prisma.payment.count({ where }),
//     ])

//     return NextResponse.json({
//       payments,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     })
//   } catch (error) {
//     console.error("Payments fetch error:", error)
//     return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const data = await request.json()

//     const payment = await prisma.payment.create({
//       data: {
//         saleId: data.saleId,
//         amount: data.amount,
//         type: data.type,
//         method: data.method,
//         reference: data.reference,
//         note: data.note,
//         paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
//       },
//       include: {
//         sale: {
//           include: {
//             customer: true,
//           },
//         },
//       },
//     })

//     return NextResponse.json(payment, { status: 201 })
//   } catch (error) {
//     console.error("Payment creation error:", error)
//     return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
//   }
// }

