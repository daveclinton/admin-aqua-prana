import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type {
  OverviewStatsDTO,
  PondAnalyticsDTO,
  AquagptAnalyticsDTO,
  MarketplaceAnalyticsDTO,
  UserAnalyticsDTO,
} from "@/features/analytics/types"

export async function getOverviewStats(): Promise<OverviewStatsDTO> {
  const res = await api<ApiSuccessResponse<OverviewStatsDTO>>("/v1/admin/overview/stats")
  return res.data
}

export async function getPondAnalytics(range = "30d"): Promise<PondAnalyticsDTO> {
  const res = await api<ApiSuccessResponse<PondAnalyticsDTO>>(
    `/v1/admin/analytics/ponds?range=${range}`
  )
  return res.data
}

export async function getAquagptAnalytics(range = "30d"): Promise<AquagptAnalyticsDTO> {
  const res = await api<ApiSuccessResponse<AquagptAnalyticsDTO>>(
    `/v1/admin/analytics/aquagpt?range=${range}`
  )
  return res.data
}

export async function getMarketplaceAnalytics(range = "30d"): Promise<MarketplaceAnalyticsDTO> {
  const res = await api<ApiSuccessResponse<MarketplaceAnalyticsDTO>>(
    `/v1/admin/analytics/marketplace?range=${range}`
  )
  return res.data
}

export async function getUserAnalytics(range = "30d"): Promise<UserAnalyticsDTO> {
  const res = await api<ApiSuccessResponse<UserAnalyticsDTO>>(
    `/v1/admin/analytics/users?range=${range}`
  )
  return res.data
}
