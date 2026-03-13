"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import { updateProfile } from "@/features/auth/api/update-profile"

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.auth.me, updatedUser)
    },
  })
}
