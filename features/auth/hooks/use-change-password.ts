"use client"

import { useMutation } from "@tanstack/react-query"
import { changePassword } from "@/features/auth/api/password"

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  })
}
