import { api } from "@/lib/api/client"
import type {
  ApiSuccessResponse,
  UserPreferences,
  UpdatePreferencesRequest,
} from "@/types/auth"

export async function getPreferences(): Promise<UserPreferences> {
  const res = await api<ApiSuccessResponse<UserPreferences>>(
    "/v1/auth/preferences"
  )
  return res.data
}

export async function updatePreferences(
  data: UpdatePreferencesRequest
): Promise<UserPreferences> {
  const res = await api<ApiSuccessResponse<UserPreferences>>(
    "/v1/auth/preferences",
    {
      method: "PUT",
      body: data,
    }
  )
  return res.data
}
