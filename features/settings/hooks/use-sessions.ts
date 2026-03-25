"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import { getSessions, revokeSession } from "@/features/settings/api/sessions"

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.auth.sessions,
    queryFn: getSessions,
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions })
    },
  })
}
