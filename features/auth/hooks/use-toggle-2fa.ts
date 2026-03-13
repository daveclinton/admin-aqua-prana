"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import { toggle2FA } from "@/features/auth/api/two-factor"
import type { CurrentUser } from "@/types/auth"

export function useToggle2FA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggle2FA,
    onSuccess: (result) => {
      // Update the cached user with the new 2FA state
      queryClient.setQueryData(
        queryKeys.auth.me,
        (prev: CurrentUser | undefined) =>
          prev
            ? { ...prev, two_factor_enabled: result.two_factor_enabled }
            : prev
      )
    },
  })
}
