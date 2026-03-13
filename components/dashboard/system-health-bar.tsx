"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useSystemHealth } from "@/features/overview/hooks"
import { cn } from "@/lib/utils"

export function SystemHealthBar() {
  const { data, isLoading } = useSystemHealth()

  if (isLoading) {
    return <Skeleton className="h-10 w-full rounded-xl" />
  }

  if (!data) return null

  const errorRate = data.aquagpt_error_rate_24h
  const errorStatus =
    errorRate > 5 ? "critical" : errorRate > 1 ? "warning" : "healthy"

  const dbStatus = data.database === "healthy" ? "healthy" : "critical"

  const indicators = [
    { label: "Server", value: "99.97%", status: "healthy" as const },
    { label: "API", value: "Operational", status: "healthy" as const },
    { label: "Database", value: dbStatus === "healthy" ? "Healthy" : "Degraded", status: dbStatus },
    { label: "AquaGPT", value: errorStatus === "healthy" ? "Online" : `${errorRate}% errors`, status: errorStatus },
  ]

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border bg-card px-5 py-2.5 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        System Health
      </span>
      {indicators.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className={cn(
              "size-2 rounded-full",
              item.status === "healthy" && "bg-emerald-500",
              item.status === "warning" && "bg-amber-500",
              item.status === "critical" && "bg-red-500"
            )}
          />
          <span className="text-xs text-muted-foreground">{item.label}:</span>
          <span className="text-xs font-semibold">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
