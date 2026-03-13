/**
 * Browser-side API client.
 * All calls go through our Next.js proxy routes (/api/proxy/...)
 * which forward them to the backend with proper auth headers.
 *
 * This keeps tokens in httpOnly cookies — never exposed to JS.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function api<T>(
  path: string,
  init?: Omit<RequestInit, "body"> & { body?: unknown }
): Promise<T> {
  const { body, headers: customHeaders, ...rest } = init || {}

  const res = await fetch(`/api/proxy${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(customHeaders as Record<string, string>),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  })

  // Auth errors — redirect to login
  if (res.status === 401) {
    // Try silent refresh
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })

    if (refreshRes.ok) {
      // Retry the original request once
      const retryRes = await fetch(`/api/proxy${path}`, {
        ...rest,
        headers: {
          "Content-Type": "application/json",
          ...(customHeaders as Record<string, string>),
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
      })

      if (retryRes.ok) {
        return retryRes.json()
      }
    }

    // Refresh also failed — redirect to login
    window.location.href = "/login"
    throw new ApiError("Session expired", 401, "UNAUTHORIZED")
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    throw new ApiError(
      errorBody?.error?.message || `Request failed with status ${res.status}`,
      res.status,
      errorBody?.error?.code
    )
  }

  return res.json()
}
