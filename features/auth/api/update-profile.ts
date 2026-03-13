import { api } from "@/lib/api/client"
import type {
  CurrentUser,
  UpdateProfileRequest,
  ApiSuccessResponse,
} from "@/types/auth"

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<CurrentUser> {
  const res = await api<ApiSuccessResponse<CurrentUser>>("/v1/auth/me", {
    method: "PATCH",
    body: data,
  })
  return res.data
}
