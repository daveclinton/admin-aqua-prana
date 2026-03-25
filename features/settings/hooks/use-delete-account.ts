"use client"

import { useMutation } from "@tanstack/react-query"
import { deleteAccount } from "@/features/settings/api/account"

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
  })
}
