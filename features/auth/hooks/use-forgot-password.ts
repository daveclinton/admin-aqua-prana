"use client"

import { useMutation } from "@tanstack/react-query"
import { forgotPassword } from "@/features/auth/api/password"

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  })
}
