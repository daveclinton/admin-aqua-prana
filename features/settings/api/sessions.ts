import { api } from "@/lib/api/client"
import type {
  ApiSuccessResponse,
  SessionsResponse,
  RevokeSessionRequest,
} from "@/types/auth"

export async function getSessions(): Promise<SessionsResponse> {
  const res = await api<ApiSuccessResponse<SessionsResponse>>(
    "/v1/auth/sessions"
  )
  return res.data
}

export async function revokeSession(
  data: RevokeSessionRequest
): Promise<{ revoked: boolean; message: string }> {
  const res = await api<
    ApiSuccessResponse<{ revoked: boolean; message: string }>
  >("/v1/auth/sessions", {
    method: "DELETE",
    body: data,
  })
  return res.data
}
