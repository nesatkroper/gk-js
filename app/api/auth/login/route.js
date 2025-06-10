
import { NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth"
import prisma from "@/lib/prisma";

// ... (previous imports remain the same)

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for:", email)

    // Input validation (remains the same)
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const sanitizedEmail = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Find user (remains the same)
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

    // Create proper payload for token generation
    const tokenPayload = {
      authId: auth.authId,
      role: auth.Role?.name || 'user', // Provide default role if null
      status: auth.status,
      // You can add additional claims if needed
      email: auth.email,
    }

    // Generate token with full payload
    const token = await generateToken(tokenPayload)

    console.log("Generated token for:", sanitizedEmail)

    // Update last login
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

    // Set secure HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// export async function POST(request: NextRequest) {
//   // const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
//   // const userAgent = request.headers.get("user-agent") || ""

//   try {
//     const body = await request.json()
//     const { email, password } = body

//     console.log("Login attempt for:", email)

//     // Input validation
//     if (!email || !password) {
//       return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
//     }

//     // Sanitize email
//     const sanitizedEmail = email.toLowerCase().trim()

//     // Email format validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     if (!emailRegex.test(sanitizedEmail)) {
//       return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
//     }

//     // Find user
//     const auth = await prisma.auth.findUnique({
//       where: { email: sanitizedEmail },
//       include: {
//         Role: true,
//         Employee: {
//           include: {
//             Department: true,
//             Position: true,
//             Employeeinfo: true,
//           },
//         },
//       },
//     })

//     // Log failed attempt if user not found
//     if (!auth) {
//       console.log("User not found:", sanitizedEmail)
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     // Check account status
//     if (auth.status !== "active") {
//       console.log("Account not active:", sanitizedEmail)
//       return NextResponse.json({ error: "Account is not active" }, { status: 401 })
//     }

//     // Verify password
//     const isValidPassword = await verifyPassword(password, auth.password)
//     if (!isValidPassword) {
//       console.log("Invalid password for:", sanitizedEmail)
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     // Generate secure token
//     const token = await generateToken(auth.authId)

//     console.log("Generated token for:", sanitizedEmail)

//     // Update last login
//     await prisma.auth.update({
//       where: { authId: auth.authId },
//       data: { lastLoginAt: new Date() },
//     })

//     console.log("Login successful for:", sanitizedEmail)

//     const response = NextResponse.json({
//       message: "Login successful",
//       user: {
//         authId: auth.authId,
//         email: auth.email,
//         state:auth.status,
//         role: auth.Role?.name,
//         employee: auth.Employee,
//       },
//     })

//     // Set secure HTTP-only cookie
//     response.cookies.set("auth-token", token, {
//       httpOnly: true,
//       // secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 8 * 60 * 60, // 8 hours
//       path: "/",
//     })

//     console.log("Cookie set for:", sanitizedEmail)

//     return response
//   } catch (error) {
//     console.error("Login error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }


