"use client"

import { useQuery } from "@tanstack/react-query"
import { useQueryState, parseAsStringLiteral } from "nuqs"
import { MessageSquare, Calendar, CheckCircle2, AlertTriangle } from "lucide-react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { queryKeys } from "@/lib/react-query/query-keys"
import { getAquagptAnalytics } from "@/features/aquagpt/api"

export function AquagptAnalytics() {
  const [range] = useQueryState(
    "range",
    parseAsStringLiteral(["7d", "30d", "90d"] as const).withDefault("7d")
  )

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.analytics.aquagpt(range),
    queryFn: () => getAquagptAnalytics(range),
  })

  const summary = data?.summary

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Chats Today"
        value={summary?.chats_today?.toLocaleString() ?? "0"}
        icon={MessageSquare}
        variant="default"
      />
      <KpiCard
        title="This Week"
        value={summary?.chats_this_week?.toLocaleString() ?? "0"}
        icon={Calendar}
        variant="default"
      />
      <KpiCard
        title="Resolutions"
        value={summary?.resolutions?.toLocaleString() ?? "0"}
        icon={CheckCircle2}
        variant="default"
      />
      <KpiCard
        title="Escalated"
        value={summary?.escalated_count?.toLocaleString() ?? "0"}
        icon={AlertTriangle}
        variant="red"
      />
    </div>
  )
}
