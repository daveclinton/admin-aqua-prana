import { cookies } from "next/headers"

const ACCESS_TOKEN_COOKIE = "aq_admin_access_token"
const REFRESH_TOKEN_COOKIE = "aq_admin_refresh_token"

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

/**
 * Store both tokens in httpOnly cookies after login/refresh.
 */
export async function setTokens(accessToken: string, refreshToken: string) {
  const jar = await cookies()

  jar.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60, // 1 hour — matches backend access token TTL
  })

  jar.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60, // 30 days — matches backend refresh token TTL
  })
}

/**
 * Read the access token from cookies.
 */
export async function getAccessToken(): Promise<string | undefined> {
  const jar = await cookies()
  return jar.get(ACCESS_TOKEN_COOKIE)?.value
}

/**
 * Read the refresh token from cookies.
 */
export async function getRefreshToken(): Promise<string | undefined> {
  const jar = await cookies()
  return jar.get(REFRESH_TOKEN_COOKIE)?.value
}

/**
 * Clear both tokens (logout).
 */
export async function clearTokens() {
  const jar = await cookies()
  jar.delete(ACCESS_TOKEN_COOKIE)
  jar.delete(REFRESH_TOKEN_COOKIE)
}
