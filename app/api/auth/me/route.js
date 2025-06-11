import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import  prisma  from "@/lib/prisma"

export const runtime = 'nodejs';
export async function GET(request) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await prisma.auth.findUnique({
      where: { authId: decoded.authId },
      include: {
        Role: true,
        Employee: {
          include: {
            Department: true,
            Position: true,
            Branch: true,
            Employeeinfo: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in /api/auth/me:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
