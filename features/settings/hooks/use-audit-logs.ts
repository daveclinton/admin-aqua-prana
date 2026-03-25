"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import { getAuditLogs } from "@/features/settings/api/audit-logs"
import type { GetAuditLogsParams } from "@/types/auth"

export function useAuditLogs(params: GetAuditLogsParams = {}) {
  return useQuery({
    queryKey: queryKeys.auditLogs.all(params as Record<string, unknown>),
    queryFn: () => getAuditLogs(params),
  })
}
