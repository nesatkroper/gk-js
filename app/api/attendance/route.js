import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { softDeleteWhere } from "@/lib/soft-delete"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const employeeId = searchParams.get("employeeId")
    const date = searchParams.get("date")
    const month = searchParams.get("month")

    const skip = (page - 1) * limit

    const where = {
      employee: softDeleteWhere.active,
    }

    if (employeeId) where.employeeId = employeeId
    if (date) {
      const targetDate = new Date(date)
      where.attendanceDate = {
        gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      }
    }
    if (month) {
      const [year, monthNum] = month.split("-")
      const startDate = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1, 1)
      const endDate = new Date(Number.parseInt(year), Number.parseInt(monthNum), 0)
      where.attendanceDate = {
        gte: startDate,
        lte: endDate,
      }
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          Employee: {
            include: {
              Department: true,
              Position: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { attendanceDate: "desc" },
      }),
      prisma.attendance.count({ where }),
    ])

    return NextResponse.json({
      attendances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Attendance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: data.employeeId,
        attendanceDate: new Date(data.attendanceDate),
        checkIn: data.checkIn ? new Date(`${data.attendanceDate}T${data.checkIn}`) : null,
        checkOut: data.checkOut ? new Date(`${data.attendanceDate}T${data.checkOut}`) : null,
        status: data.status || "present",
        note: data.note,
      },
      include: {
        Employee: true,
      },
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error("Attendance creation error:", error)
    return NextResponse.json({ error: "Failed to create attendance record" }, { status: 500 })
  }
}
