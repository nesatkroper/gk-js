import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()

    const existingEvent = await prisma.event.findUnique({ where: { eventId: id } })
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (data.eventName === "") {
      return NextResponse.json({ error: "Event name cannot be empty" }, { status: 400 })
    }
    if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 })
    }

    const addressData = data.Address
    const updatedEvent = await prisma.event.update({
      where: { eventId: id },
      data: {
        eventName: data.eventName || undefined,
        memo: data.memo || null,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        updatedAt: new Date(),
      },
      include: { Address: true },
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = params
    const existingEvent = await prisma.event.findUnique({ where: { eventId: id } })
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    await prisma.event.delete({ where: { eventId: id } })
    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete event" }, { status: 500 })
  }
}