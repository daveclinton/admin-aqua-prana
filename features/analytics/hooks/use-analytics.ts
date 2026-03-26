"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getOverviewStats,
  getPondAnalytics,
  getAquagptAnalytics,
  getMarketplaceAnalytics,
  getUserAnalytics,
} from "@/features/analytics/api/analytics-api"

const RANGE_MAP: Record<string, string> = {
  "7D": "7d",
  "30D": "30d",
  "90D": "90d",
  "12M": "1y",
}

export function useOverviewStats() {
  return useQuery({
    queryKey: ["analytics", "overview-stats"],
    queryFn: getOverviewStats,
  })
}

export function usePondAnalytics(range: string) {
  const apiRange = RANGE_MAP[range] ?? "30d"
  return useQuery({
    queryKey: ["analytics", "ponds", apiRange],
    queryFn: () => getPondAnalytics(apiRange),
  })
}

export function useAquagptAnalytics(range: string) {
  const apiRange = RANGE_MAP[range] ?? "30d"
  return useQuery({
    queryKey: ["analytics", "aquagpt", apiRange],
    queryFn: () => getAquagptAnalytics(apiRange),
  })
}

export function useMarketplaceAnalytics(range: string) {
  const apiRange = RANGE_MAP[range] ?? "30d"
  return useQuery({
    queryKey: ["analytics", "marketplace", apiRange],
    queryFn: () => getMarketplaceAnalytics(apiRange),
  })
}

export function useUserAnalytics(range: string) {
  const apiRange = RANGE_MAP[range] ?? "30d"
  return useQuery({
    queryKey: ["analytics", "users", apiRange],
    queryFn: () => getUserAnalytics(apiRange),
  })
}
