"use client"

import { useMutation } from "@tanstack/react-query"
import { verifyResetCode, resetPassword } from "@/features/auth/api/password"

export function useVerifyResetCode() {
  return useMutation({
    mutationFn: verifyResetCode,
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  })
}
