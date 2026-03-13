import { NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/constants/routes"
import { setTokens } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Always send role: "admin" — backend now accepts it
  const payload = { ...body, role: "admin" }

  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const json = await res.json()

  // If 2FA is required, the backend returns 403 with challenge_id in error.details
  if (json.error?.code === "TWO_FACTOR_REQUIRED" && json.error?.details?.challenge_id) {
    return NextResponse.json({
      success: true,
      data: {
        challenge_id: json.error.details.challenge_id,
        channel: json.error.details.channel ?? "email",
      },
    })
  }

  if (!res.ok) {
    return NextResponse.json(json, { status: res.status })
  }

  // Verify the user actually has admin role
  const userRole = json.data?.user?.role ?? json.data?.user?.profile?.role
  if (userRole !== "admin") {
    return NextResponse.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "This account does not have admin access" },
      },
      { status: 403 }
    )
  }

  // Store tokens in httpOnly cookies
  const { access_token, refresh_token } = json.data
  if (access_token && refresh_token) {
    await setTokens(access_token, refresh_token)
  }

  // Return user data without exposing raw tokens to the browser
  return NextResponse.json({
    success: true,
    data: {
      user: json.data.user,
      requires_2fa: false,
    },
  })
}
