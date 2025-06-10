import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const addresses = await prisma.address.findMany({
      where: { status: "active" },
      include: {
        City: { select: { cityId: true, name: true } },
        State: { select: { stateId: true, name: true } },
      },
    })
    return NextResponse.json(addresses)
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch addresses" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    if (data.cityId) {
      const city = await prisma.city.findUnique({ where: { cityId: data.cityId } })
      if (!city) return NextResponse.json({ error: "City not found" }, { status: 404 })
    }
    if (data.stateId) {
      const state = await prisma.state.findUnique({ where: { stateId: data.stateId } })
      if (!state) return NextResponse.json({ error: "State not found" }, { status: 404 })
    }
    if (data.customerId) {
      const customer = await prisma.customer.findUnique({ where: { customerId: data.customerId } })
      if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }
    if (data.employeeId) {
      const employee = await prisma.employee.findUnique({ where: { employeeId: data.employeeId } })
      if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }
    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({ where: { supplierId: data.supplierId } })
      if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }
    if (data.eventId) {
      const event = await prisma.event.findUnique({ where: { eventId: data.eventId } })
      if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const address = await prisma.address.create({
      data: {
        cityId: data.cityId || null,
        stateId: data.stateId || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        customerId: data.customerId || null,
        employeeId: data.employeeId || null,
        supplierId: data.supplierId || null,
        eventId: data.eventId || null,
        status: "active",
      },
      include: {
        City: { select: { cityId: true, name: true } },
        State: { select: { stateId: true, name: true } },
      },
    })

    return NextResponse.json(address, { status: 201 })
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to create address" }, { status: 500 })
  }
}
