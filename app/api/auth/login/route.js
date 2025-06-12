
import { NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth"
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const sanitizedEmail = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const auth = await prisma.auth.findUnique({
      where: { email: sanitizedEmail },
      include: {
        Role: true,
        Employee: {
          include: {
            Department: true,
            Position: true,
            Employeeinfo: true,
          },
        },
      },
    })

    if (!auth) {
      console.log("User not found:", sanitizedEmail)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (auth.status !== "active") {
      console.log("Account not active:", sanitizedEmail)
      return NextResponse.json({ error: "Account is not active" }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, auth.password)
    if (!isValidPassword) {
      console.log("Invalid password for:", sanitizedEmail)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const tokenPayload = {
      authId: auth.authId,
      role: auth.Role?.name || 'user', 
      status: auth.status,
      email: auth.email,
    }

    const token = await generateToken(tokenPayload)

    console.log("Generated token for:", sanitizedEmail)

    await prisma.auth.update({
      where: { authId: auth.authId },
      data: { lastLoginAt: new Date() },
    })

    console.log("Login successful for:", sanitizedEmail)

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        authId: auth.authId,
        email: auth.email,
        state: auth.status,
        role: auth.Role?.name,
        employee: auth.Employee,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 8 * 60 * 60, 
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
