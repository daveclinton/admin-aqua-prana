import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/constants/routes"
import { getRefreshToken, setTokens, clearTokens } from "@/lib/auth/session"

export async function POST() {
  const refreshToken = await getRefreshToken()

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: { message: "No refresh token" } },
      { status: 401 }
    )
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  const json = await res.json()

  if (!res.ok) {
    // Refresh token is invalid/expired — clear everything
    await clearTokens()
    return NextResponse.json(
      { success: false, error: { message: "Session expired" } },
      { status: 401 }
    )
  }

  const { access_token, refresh_token } = json.data
  await setTokens(access_token, refresh_token)

  return NextResponse.json({ success: true })
}
