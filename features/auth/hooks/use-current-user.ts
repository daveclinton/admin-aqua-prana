"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import { getCurrentUser } from "@/features/auth/api/get-current-user"

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getCurrentUser,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}
