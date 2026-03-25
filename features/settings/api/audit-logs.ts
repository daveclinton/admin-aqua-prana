import { api } from "@/lib/api/client"
import type {
  ApiSuccessResponse,
  AuditLogsResponse,
  GetAuditLogsParams,
} from "@/types/auth"

export async function getAuditLogs(
  params: GetAuditLogsParams = {}
): Promise<AuditLogsResponse> {
  const searchParams = new URLSearchParams()

  if (params.action) searchParams.set("action", params.action)
  if (params.user_id) searchParams.set("user_id", params.user_id)
  if (params.success) searchParams.set("success", params.success)
  if (params.search) searchParams.set("search", params.search)
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.offset != null) searchParams.set("offset", String(params.offset))

  const qs = searchParams.toString()
  const res = await api<ApiSuccessResponse<AuditLogsResponse>>(
    `/v1/admin/audit-logs${qs ? `?${qs}` : ""}`
  )
  return res.data
}
