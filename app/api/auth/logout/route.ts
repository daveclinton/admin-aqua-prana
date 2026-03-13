import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/constants/routes"
import { getAccessToken, getRefreshToken, clearTokens } from "@/lib/auth/session"

export async function POST() {
  const accessToken = await getAccessToken()
  const refreshToken = await getRefreshToken()

  // Tell the backend to invalidate the session
  if (accessToken || refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(
          refreshToken ? { refresh_token: refreshToken } : {}
        ),
      })
    } catch {
      // Best-effort — clear cookies regardless
    }
  }

  await clearTokens()

  return NextResponse.json({ success: true })
}
