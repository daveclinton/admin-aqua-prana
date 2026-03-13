import { NextRequest, NextResponse } from "next/server"
import { serverFetch, ApiError } from "@/lib/api/server-client"

export async function GET() {
  try {
    const { data } = await serverFetch("/api/v1/auth/me")
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { success: false, error: { message: "Internal error" } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { data } = await serverFetch("/api/v1/auth/me", {
      method: "PATCH",
      body,
    })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { success: false, error: { message: "Internal error" } },
      { status: 500 }
    )
  }
}
