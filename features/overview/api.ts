import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type {
  OverviewStats,
  OverviewTrends,
  OverviewAlert,
  ActivityItem,
  SystemHealth,
} from "./types"

export async function getOverviewStats(): Promise<OverviewStats> {
  const res = await api<ApiSuccessResponse<OverviewStats>>(
    "/v1/admin/overview/stats"
  )
  return res.data
}

export async function getOverviewTrends(
  range: string = "7d"
): Promise<OverviewTrends> {
  const res = await api<ApiSuccessResponse<OverviewTrends>>(
    `/v1/admin/overview/trends?range=${range}`
  )
  return res.data
}

export async function getOverviewAlerts(): Promise<{ alerts: OverviewAlert[] }> {
  const res = await api<ApiSuccessResponse<{ alerts: OverviewAlert[] }>>(
    "/v1/admin/overview/alerts"
  )
  return res.data
}

export async function getOverviewActivity(
  filter?: string
): Promise<{ activity: ActivityItem[] }> {
  const params = new URLSearchParams({ limit: "10" })
  if (filter) params.set("filter", filter)
  const res = await api<ApiSuccessResponse<{ activity: ActivityItem[] }>>(
    `/v1/admin/overview/activity?${params}`
  )
  return res.data
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const res = await api<ApiSuccessResponse<SystemHealth>>(
    "/v1/admin/overview/system-health"
  )
  return res.data
}
