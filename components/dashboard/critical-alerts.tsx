"use client"

import {
  AlertTriangle,
  Info,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useOverviewAlerts } from "@/features/overview/hooks"
import type { OverviewAlert } from "@/features/overview/types"

const severityConfig: Record<
  OverviewAlert["severity"],
  { icon: typeof AlertTriangle; variant: "destructive" | "outline" | "secondary" }
> = {
  critical: { icon: ShieldAlert, variant: "destructive" },
  warning: { icon: AlertTriangle, variant: "outline" },
  info: { icon: Info, variant: "secondary" },
}

export function CriticalAlerts() {
  const { data, isLoading } = useOverviewAlerts()
  const alerts = data?.alerts ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            All clear — no alerts right now
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.map((alert, i) => {
              const config = severityConfig[alert.severity]
              const Icon = config.icon
              return (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-md border px-3 py-2"
                >
                  <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 text-xs">{alert.message}</div>
                  <Badge variant={config.variant} className="shrink-0">
                    {alert.severity}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
