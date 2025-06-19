import { logout } from "@/app/actions/auth"

export async function POST() {
  return await logout()
}