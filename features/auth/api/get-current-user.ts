import { api } from "@/lib/api/client"
import type { CurrentUser, ApiSuccessResponse } from "@/types/auth"

export async function getCurrentUser(): Promise<CurrentUser> {
  const res = await api<ApiSuccessResponse<CurrentUser>>("/v1/auth/me")
  return res.data
}
