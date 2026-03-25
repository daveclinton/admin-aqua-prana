"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import {
  getPreferences,
  updatePreferences,
} from "@/features/settings/api/preferences"
import type { UserPreferences } from "@/types/auth"

export function usePreferences() {
  return useQuery({
    queryKey: queryKeys.auth.preferences,
    queryFn: getPreferences,
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.auth.preferences, result)
    },
  })
}
