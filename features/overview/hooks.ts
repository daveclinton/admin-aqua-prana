"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import {
  getOverviewStats,
  getOverviewTrends,
  getOverviewAlerts,
  getOverviewActivity,
  getSystemHealth,
} from "./api"

export function useOverviewStats() {
  return useQuery({
    queryKey: queryKeys.overview.stats,
    queryFn: getOverviewStats,
    staleTime: 30_000,
  })
}

export function useOverviewTrends(range: string = "7d") {
  return useQuery({
    queryKey: queryKeys.overview.trends(range),
    queryFn: () => getOverviewTrends(range),
    staleTime: 60_000,
  })
}

export function useOverviewAlerts() {
  return useQuery({
    queryKey: queryKeys.overview.alerts,
    queryFn: getOverviewAlerts,
    staleTime: 60_000,
  })
}

export function useOverviewActivity(filter?: string) {
  return useQuery({
    queryKey: queryKeys.overview.activity(filter),
    queryFn: () => getOverviewActivity(filter),
    staleTime: 30_000,
  })
}

export function useSystemHealth() {
  return useQuery({
    queryKey: queryKeys.overview.systemHealth,
    queryFn: getSystemHealth,
    staleTime: 60_000,
  })
}
