"use client"

import {
  Database,
  Users,
  Zap,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSystemHealth } from "@/features/overview/hooks"
import { cn } from "@/lib/utils"

export function SystemHealthBar() {
  const { data, isLoading } = useSystemHealth()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System health</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const errorRate = data.aquagpt_error_rate_24h
  const errorStatus =
    errorRate > 5 ? "critical" : errorRate > 1 ? "warning" : "healthy"

  const indicators = [
    {
      label: "Database",
      value: data.database,
      status: data.database === "healthy" ? "healthy" : "critical",
      icon: Database,
    },
    {
      label: "Active sessions",
      value: data.active_sessions.toLocaleString(),
      status: "healthy" as const,
      icon: Users,
    },
    {
      label: "AquaGPT errors (24h)",
      value: `${errorRate}%`,
      status: errorStatus,
      icon: Zap,
    },
    {
      label: "Audit events (24h)",
      value: data.audit_events_24h.toLocaleString(),
      status: "healthy" as const,
      icon: ShieldCheck,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>System health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {indicators.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex items-center gap-2.5 rounded-md border px-3 py-2"
              >
                <div
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    item.status === "healthy" && "bg-emerald-500",
                    item.status === "warning" && "bg-amber-500",
                    item.status === "critical" && "bg-red-500"
                  )}
                />
                <Icon className="size-3.5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.625rem] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs font-medium">{item.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
