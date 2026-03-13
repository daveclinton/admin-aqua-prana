import { NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/constants/routes"

export async function POST(request: NextRequest) {
  const body = await request.json()

  const res = await fetch(`${API_BASE_URL}/api/v1/auth/password/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
