import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

// Define protected routes and their required roles
const protectedRoutes= {
  "/admin": ["admin"],
  "/auth": ["admin", "manager"],
  "/roles": ["admin", "manager"],
  "/reports": ["admin", "manager"],
  "/dashboard": ["admin", "manager"],
  "/dashboard/employees": ["admin", "manager",],
  "/dashboard/products": ["admin", "manager", "staff",],
  "/dashboard/inventory": ["admin", "manager", "staff"],
  "/dashboard/categories": ["admin", "manager", "staff"],
  "/dashboard/profile": ["admin", "manager", "staff", "user", 'agent'],
}

const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/_next/static",
  "/_next/image",
  "/favicon.ico"
]

export async function middleware(request) {
  const { pathname } = request.nextUrl


  const response = NextResponse.next()
  setSecurityHeaders(response)

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return response
  }

  const requiredRoles = Object.entries(protectedRoutes).find(([route]) =>
    pathname.startsWith(route)
  )?.[1]

  if (!requiredRoles) {
    return response
  }

  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    console.log("No token found, redirecting to login")
    return redirectToLogin(request)
  }

  try {
    const decoded = await verifyToken(token)
    if (!decoded) {
      console.log("Invalid token, redirecting to login")
      return redirectToLogin(request)
    }

    if (decoded.status !== "active") {
      console.log("Account not active, redirecting to suspended page")
      return NextResponse.redirect(new URL("/account-suspended", request.url))
    }

    if (!requiredRoles.includes(decoded.role)) {
      console.log("Insufficient permissions, redirecting to unauthorized")
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }

    response.headers.set("X-User-ID", decoded.authId)
    response.headers.set("X-User-Role", decoded.role)
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self';"
    )

    response.cookies.set("permissions", JSON.stringify({
      canCreate: ["admin", "manager", "staff"].includes(decoded.role),
      canUpdate: ["admin", "manager"].includes(decoded.role),
      canDelete: ["admin"].includes(decoded.role),
    }), {
      httpOnly: false, // Must be false to access via client-side JS
      sameSite: "lax",
      path: "/"
    });


    return response
  } catch (error) {
    console.error("Authentication error:", error)
    return redirectToLogin(request)
  }
}

function setSecurityHeaders(response) {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self';"
  )
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
}

// Helper function to redirect to login and clear invalid token
function redirectToLogin(request) {
  const response = NextResponse.redirect(new URL("/login", request.url))
  response.cookies.delete("auth-token")
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public routes defined above
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}