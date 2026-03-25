import { api } from "@/lib/api/client"
import type {
  ApiSuccessResponse,
  NotificationPreferencesResponse,
  NotificationPreference,
  UpdateNotificationPreferenceRequest,
} from "@/types/auth"

export async function getNotificationPreferences(): Promise<NotificationPreferencesResponse> {
  const res = await api<ApiSuccessResponse<NotificationPreferencesResponse>>(
    "/v1/notifications/preferences"
  )
  return res.data
}

export async function updateNotificationPreference(
  data: UpdateNotificationPreferenceRequest
): Promise<NotificationPreference> {
  const res = await api<ApiSuccessResponse<NotificationPreference>>(
    "/v1/notifications/preferences",
    {
      method: "PUT",
      body: data,
    }
  )
  return res.data
}
