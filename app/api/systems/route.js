import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export async function GET() {
  try {
    const systems = await prisma.system.findMany({
      where: { status: "active" },
    })
    // Exclude sensitive fields
    const sanitizedSystems = systems.map(({ apiSecret, ...rest }) => rest)
    return NextResponse.json(sanitizedSystems)
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch system records" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    if (!data.systemName) {
      return NextResponse.json({ error: "System name is required" }, { status: 400 })
    }

    // Generate unique apiKey and apiSecret
    const apiKey = crypto.randomBytes(32).toString("hex")
    const apiSecret = crypto.randomBytes(64).toString("hex")

    // Validate email if provided
    if (data.ownerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.ownerEmail)) {
        return NextResponse.json({ error: "Invalid owner email" }, { status: 400 })
      }
    }

    // Validate phone if provided
    if (data.ownerPhone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/
      if (!phoneRegex.test(data.ownerPhone)) {
        return NextResponse.json({ error: "Invalid owner phone number" }, { status: 400 })
      }
    }

    // Validate apiUrl
    if (!data.apiUrl || !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(data.apiUrl)) {
      return NextResponse.json({ error: "Invalid API URL" }, { status: 400 })
    }

    const system = await prisma.system.create({
      data: {
        systemName: data.systemName,
        systemType: data.systemType || "default",
        ownerName: data.ownerName || null,
        ownerEmail: data.ownerEmail || null,
        ownerPhone: data.ownerPhone || null,
        apiKey,
        apiSecret,
        apiUrl: data.apiUrl,
        apiVersion: data.apiVersion || "v1",
        description: data.description || null,
        status: "active",
        updatedAt: new Date(),
      },
    })

    // Exclude apiSecret from response
    const { apiSecret: _, ...responseSystem } = system
    return NextResponse.json(responseSystem, { status: 201 })
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || "Failed to create system record" },
      { status: 500 }
    )
  }
}