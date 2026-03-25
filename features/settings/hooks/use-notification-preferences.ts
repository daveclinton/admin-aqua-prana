"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import {
  getNotificationPreferences,
  updateNotificationPreference,
} from "@/features/settings/api/notifications"
import type {
  NotificationPreferencesResponse,
  UpdateNotificationPreferenceRequest,
} from "@/types/auth"

export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.notifications.preferences,
    queryFn: getNotificationPreferences,
  })
}

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateNotificationPreference,
    onSuccess: (result) => {
      queryClient.setQueryData(
        queryKeys.notifications.preferences,
        (prev: NotificationPreferencesResponse | undefined) => {
          if (!prev) return prev
          return {
            ...prev,
            preferences: prev.preferences.map((p) =>
              p.category === result.category ? result : p
            ),
          }
        }
      )
    },
  })
}
