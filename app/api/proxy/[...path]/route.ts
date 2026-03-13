import { NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/constants/routes"
import { getAccessToken } from "@/lib/auth/session"

/**
 * Catch-all proxy route handler.
 *
 * Browser calls:  /api/proxy/v1/admin/users?page=1
 * This forwards to: ${API_BASE_URL}/api/v1/admin/users?page=1
 *
 * Automatically attaches the Bearer token from httpOnly cookies.
 */
async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const backendPath = `/api/${path.join("/")}`
  const url = new URL(backendPath, API_BASE_URL)

  // Forward query params
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value)
  })

  const accessToken = await getAccessToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  // Forward the request body for non-GET methods
  let body: string | undefined
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const json = await request.json()
      body = JSON.stringify(json)
    } catch {
      // No body or non-JSON body — that's fine
    }
  }

  const res = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  })

  const responseBody = await res.text()

  return new NextResponse(responseBody, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/json",
    },
  })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
