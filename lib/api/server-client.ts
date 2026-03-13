import { API_BASE_URL } from "@/lib/constants/routes"
import { getAccessToken } from "@/lib/auth/session"

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
}

/**
 * Server-side fetch wrapper for calling the backend API.
 * Automatically attaches the Bearer token from session cookies.
 *
 * Used inside Next.js Route Handlers and Server Components only.
 */
export async function serverFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; status: number }> {
  const accessToken = await getAccessToken()

  const { body, headers: customHeaders, ...rest } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })

  const json = await res.json().catch(() => null)

  if (!res.ok) {
    const error = json as { error?: { code?: string; message?: string } } | null
    throw new ApiError(
      error?.error?.message || `Request failed with status ${res.status}`,
      res.status,
      error?.error?.code
    )
  }

  return { data: json as T, status: res.status }
}

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
