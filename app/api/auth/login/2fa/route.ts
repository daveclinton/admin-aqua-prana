import { NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/constants/routes"
import { setTokens } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  const body = await request.json()

  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login/2fa/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const json = await res.json()

  if (!res.ok) {
    return NextResponse.json(json, { status: res.status })
  }

  // Store tokens in httpOnly cookies
  const { access_token, refresh_token } = json.data
  if (access_token && refresh_token) {
    await setTokens(access_token, refresh_token)
  }

  return NextResponse.json({
    success: true,
    data: {
      user: json.data.user,
    },
  })
}
