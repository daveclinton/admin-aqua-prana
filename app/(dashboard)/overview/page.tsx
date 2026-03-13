"use client"

import {
  LayoutGrid,
  User,
  Users,
  AlertTriangle,
} from "lucide-react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { CriticalAlerts } from "@/components/dashboard/critical-alerts"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { SystemHealthBar } from "@/components/dashboard/system-health-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { useOverviewStats } from "@/features/overview/hooks"
import { useOverviewAlerts } from "@/features/overview/hooks"

export default function OverviewPage() {
  const { data: stats, isLoading: statsLoading } = useOverviewStats()
  const { data: alertsData } = useOverviewAlerts()

  const criticalAlertCount =
    alertsData?.alerts?.filter((a) => a.severity === "critical" || a.severity === "warning").length ?? 0

  return (
    <div className="space-y-6">
      {/* System health */}
      <SystemHealthBar />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-2xl" />
          ))
        ) : stats ? (
          <>
            <KpiCard
              title="Total Ponds"
              value={stats.total_ponds.toLocaleString()}
              icon={LayoutGrid}
              variant="teal"
            />
            <KpiCard
              title="Active Farmers"
              value={stats.total_farmers.toLocaleString()}
              icon={User}
              variant="green"
            />
            <KpiCard
              title="Partners"
              value={stats.total_partners.toLocaleString()}
              icon={Users}
              variant="amber"
            />
            <KpiCard
              title="Critical Alerts"
              value={criticalAlertCount.toString()}
              icon={AlertTriangle}
              variant="red"
              trend={criticalAlertCount > 0 ? `${criticalAlertCount}` : undefined}
            />
          </>
        ) : null}
      </div>

      {/* Performance chart + Critical alerts */}
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <PerformanceChart />
        <CriticalAlerts />
      </div>

      {/* Activity feed */}
      <ActivityFeed />
    </div>
  )
}
