"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { logout } from "@/features/auth/api/login"

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      router.push("/login")
    },
  })
}
