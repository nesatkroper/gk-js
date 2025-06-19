import { logout } from "@/app/actions/auth"

export async function POST() {
  try {
    await logout()
    return new Response(null, { status: 200 })
  } catch (error) {
    console.error("Logout error:", error)
    return new Response("Logout failed", { status: 500 })
  }
}
