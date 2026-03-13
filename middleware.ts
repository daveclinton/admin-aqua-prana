import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password", "/unauthorized"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow API routes, static files, etc.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get("aq_admin_access_token")?.value
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  // Not authenticated + trying to access protected route → redirect to login
  if (!accessToken && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated + trying to access auth pages → redirect to dashboard
  if (accessToken && isPublicRoute) {
    return NextResponse.redirect(new URL("/overview", request.url))
  }

  // Root path → redirect to overview
  if (pathname === "/") {
    if (accessToken) {
      return NextResponse.redirect(new URL("/overview", request.url))
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
