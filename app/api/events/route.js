import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { status: "active" },
      include: { Address: true },
    })
    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    if (!data.eventName) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 })
    }
    if (!data.startDate || !data.endDate) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 })
    }
    if (new Date(data.endDate) < new Date(data.startDate)) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 })
    }

    const addressData = data.Address
    const event = await prisma.event.create({
      data: {
        eventName: data.eventName,
        memo: data.memo || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: "active"
      },
      include: { Address: true },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 })
  }
}