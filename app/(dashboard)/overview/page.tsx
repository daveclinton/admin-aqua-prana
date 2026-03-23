"use client"

import {
  LayoutGrid,
  User,
  Users,
  AlertTriangle,
  DollarSign,
} from "lucide-react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { CriticalAlerts } from "@/components/dashboard/critical-alerts"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { SystemHealthBar } from "@/components/dashboard/system-health-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { useOverviewStats } from "@/features/overview/hooks"
import { useOverviewAlerts } from "@/features/overview/hooks"

function trendLabel(current: number, previous: number): string | undefined {
  if (previous === 0 && current === 0) return undefined
  if (previous === 0) return `+${current}`
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return undefined
  return pct > 0 ? `+${pct}%` : `${pct}%`
}

function formatRevenue(amount: number): string {
  if (amount >= 1_000_000) return `₹${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`
  return `₹${amount.toLocaleString()}`
}

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-2xl" />
          ))
        ) : stats ? (
          <>
            <KpiCard
              title="Total Ponds"
              value={stats.total_ponds.toLocaleString()}
              icon={LayoutGrid}
              variant="teal"
              trend={trendLabel(stats.new_ponds_7d, stats.new_ponds_prev_7d)}
              subtitle={stats.new_ponds_7d > 0 ? `${stats.new_ponds_7d} new this week` : undefined}
              href="/farmers"
            />
            <KpiCard
              title="Active Farmers"
              value={stats.total_farmers.toLocaleString()}
              icon={User}
              variant="green"
              trend={trendLabel(stats.new_farmers_7d, stats.new_farmers_prev_7d)}
              subtitle={stats.new_farmers_7d > 0 ? `${stats.new_farmers_7d} new this week` : undefined}
              href="/farmers"
            />
            <KpiCard
              title="Partners"
              value={stats.total_partners.toLocaleString()}
              icon={Users}
              variant="amber"
              trend={trendLabel(stats.new_partners_7d, stats.new_partners_prev_7d)}
              subtitle={stats.new_partners_7d > 0 ? `${stats.new_partners_7d} new this week` : undefined}
              href="/partners"
            />
            <KpiCard
              title="Revenue"
              value={formatRevenue(stats.total_revenue)}
              icon={DollarSign}
              variant="green"
              trend={trendLabel(stats.revenue_7d, stats.revenue_prev_7d)}
              subtitle={stats.revenue_7d > 0 ? `${formatRevenue(stats.revenue_7d)} this week` : undefined}
              href="/billing"
            />
            <KpiCard
              title="Critical Alerts"
              value={criticalAlertCount.toString()}
              icon={AlertTriangle}
              variant="red"
              trend={criticalAlertCount > 0 ? `${criticalAlertCount}` : undefined}
              href="/support"
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
