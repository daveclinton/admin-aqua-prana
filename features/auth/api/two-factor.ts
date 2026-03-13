import { api } from "@/lib/api/client"
import type {
  Toggle2FARequest,
  Toggle2FAResponse,
  ApiSuccessResponse,
} from "@/types/auth"

export async function toggle2FA(
  data: Toggle2FARequest
): Promise<Toggle2FAResponse> {
  const res = await api<ApiSuccessResponse<Toggle2FAResponse>>(
    "/v1/auth/2fa/toggle",
    {
      method: "POST",
      body: data,
    }
  )
  return res.data
}
