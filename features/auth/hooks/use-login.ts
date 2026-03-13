"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { login } from "@/features/auth/api/login"
import { queryKeys } from "@/lib/react-query/query-keys"

export function useLogin() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // If 2FA challenge, don't redirect — the form handles it
      if ("data" in data && "challenge_id" in data.data) {
        return
      }

      // Invalidate so the next read fetches fresh user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
      router.push("/overview")
    },
  })
}
