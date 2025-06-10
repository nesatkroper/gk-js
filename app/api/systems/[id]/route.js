import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()

    const existingSystem = await prisma.system.findUnique({ where: { systemId: id } })
    if (!existingSystem) {
      return NextResponse.json({ error: "System record not found" }, { status: 404 })
    }

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

    // Validate apiUrl if provided
    if (data.apiUrl && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(data.apiUrl)) {
      return NextResponse.json({ error: "Invalid API URL" }, { status: 400 })
    }

    // Regenerate apiKey or apiSecret if requested
    const updateData = {
      systemName: data.systemName,
      systemType: data.systemType,
      ownerName: data.ownerName || null,
      ownerEmail: data.ownerEmail || null,
      ownerPhone: data.ownerPhone || null,
      apiUrl: data.apiUrl,
      apiVersion: data.apiVersion,
      description: data.description || null,
      status: data.status,
      updatedAt: new Date(),
    }

    if (data.regenerateApiKey) {
      updateData.apiKey = crypto.randomBytes(32).toString("hex")
    }
    if (data.regenerateApiSecret) {
      updateData.apiSecret = crypto.randomBytes(64).toString("hex")
    }

    const system = await prisma.system.update({
      where: { systemId: id },
      data: updateData,
    })

    // Exclude apiSecret from response
    const { apiSecret: _, ...responseSystem } = system
    return NextResponse.json(responseSystem)
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate ${error.meta?.target?.join(", ") || "field"}` },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || "Failed to update system record" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const existingSystem = await prisma.system.findUnique({ where: { systemId: id } })
    if (!existingSystem) {
      return NextResponse.json({ error: "System record not found" }, { status: 404 })
    }

    await prisma.system.delete({ where: { systemId: id } })
    return NextResponse.json({ message: "System record deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete system record" },
      { status: 500 }
    )
  }
}