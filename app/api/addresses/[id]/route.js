import { NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()

    const existingAddress = await prisma.address.findUnique({ where: { addressId: id } })
    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

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

    const updatedAddress = await prisma.address.update({
      where: { addressId: id },
      data: {
        cityId: data.cityId !== undefined ? data.cityId : undefined,
        stateId: data.stateId !== undefined ? data.stateId : undefined,
        latitude: data.latitude !== undefined ? data.latitude : undefined,
        longitude: data.longitude !== undefined ? data.longitude : undefined,
        customerId: data.customerId !== undefined ? data.customerId : undefined,
        employeeId: data.employeeId !== undefined ? data.employeeId : undefined,
        supplierId: data.supplierId !== undefined ? data.supplierId : undefined,
        eventId: data.eventId !== undefined ? data.eventId : undefined,
        updatedAt: new Date(),
      },
      include: {
        City: { select: { cityId: true, name: true } },
        State: { select: { stateId: true, name: true } },
      },
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to update address" }, { status: 500 })
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = params
    const existingAddress = await prisma.address.findUnique({ where: { addressId: id } })
    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    await prisma.address.delete({ where: { addressId: id } })
    return NextResponse.json({ message: "Address deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete address" }, { status: 500 })
  }
}