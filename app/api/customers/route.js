import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { softDeleteWhere } from "@/lib/soft-delete"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const includeInactive = searchParams.get("includeInactive") === "true"

    const skip = (page - 1) * limit

    const where = {
      ...(includeInactive ? {} : softDeleteWhere.active),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { info: { email: { contains: search, mode: "insensitive" } } },
        ],
      }),
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          Address: true,
          Customerinfo: true,
          Employee: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              Sale: true,
            },
          },
        },

        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.count({ where }),
    ])

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Customers fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const customer = await prisma.$transaction(async (tx) => {

      const newCustomer = await tx.customer.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender || "male",
          phone: data.phone,
          employeeId: data.employeeId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      })

      if (data.email || data.region || data.note || data.govId) {
        await tx.customerinfo.create({
          data: {
            customerId: newCustomer.customerId,
            email: data.email,
            region: data.region,
            note: data.note,
            govId: data.govId,
            govExpire: data.govExpire ? new Date(data.govExpire) : null,
          },
        })
      }

      if (data.cityId || data.stateId) {
        await tx.address.create({
          data: {
            customerId: newCustomer.customerId,
            latitude: data.latitude,
            longitude: data.longitude,
            createdAt: new Date(),
            updatedAt: new Date()
          },
        })
      }

      return newCustomer
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error("Customer creation error:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
