"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { queryKeys } from "@/lib/react-query/query-keys"
import { getModelStatus } from "@/features/aquagpt/api"
import { cn } from "@/lib/utils"

export function ModelStatusCard() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.aquagpt.modelStatus,
    queryFn: getModelStatus,
    staleTime: 30_000,
    retry: 1,
  })

  if (isLoading) return <Skeleton className="h-[260px] rounded-2xl" />

  if (!data) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full items-center justify-center py-12 text-sm text-muted-foreground">
          No model data available
        </CardContent>
      </Card>
    )
  }

  const statusColor =
    data.status === "live"
      ? "bg-emerald-500"
      : data.status === "training"
        ? "bg-amber-500"
        : "bg-red-500"

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Model & Training</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Version badge */}
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", statusColor)} />
          <span className="rounded-md border px-2.5 py-1 text-xs font-medium">
            Production: AquaGPT {data.version}
          </span>
        </div>

        {/* Training progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Training progress</span>
            <span className="font-medium">{data.training_progress}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${data.training_progress}%` }}
            />
          </div>
        </div>

        {/* Stats rows */}
        <div className="space-y-3">
          <StatRow label="Escalated queries" value={data.escalated_queries} variant="red" />
          <StatRow label="Unanswered today" value={data.unanswered_today} variant="red" />
          <StatRow label="Human handoffs" value={data.human_handoffs} />
        </div>
      </CardContent>
    </Card>
  )
}

function StatRow({
  label,
  value,
  variant,
}: {
  label: string
  value: number
  variant?: "red"
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-semibold tabular-nums",
          variant === "red" && value > 0
            ? "text-red-600 dark:text-red-400"
            : "text-foreground"
        )}
      >
        {value.toLocaleString()}
      </span>
    </div>
  )
}
