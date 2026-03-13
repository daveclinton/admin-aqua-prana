"use client"

import {
  Users,
  ShoppingCart,
  DollarSign,
  PackageCheck,
} from "lucide-react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { CriticalAlerts } from "@/components/dashboard/critical-alerts"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { SystemHealthBar } from "@/components/dashboard/system-health-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { useOverviewStats } from "@/features/overview/hooks"

function formatRevenue(amount: number) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`
  return `$${amount}`
}

export default function OverviewPage() {
  const { data: stats, isLoading: statsLoading } = useOverviewStats()

  return (
    <div className="space-y-6">
      {/* System health */}
      <SystemHealthBar />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 rounded-lg p-4 ring-1 ring-foreground/10"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))
        ) : stats ? (
          <>
            <KpiCard
              title="Total Users"
              value={stats.total_users.toLocaleString()}
              trend={`+${stats.new_users_7d}`}
              subtitle="this week"
              icon={Users}
            />
            <KpiCard
              title="Total Orders"
              value={stats.total_orders.toLocaleString()}
              icon={ShoppingCart}
            />
            <KpiCard
              title="Revenue"
              value={formatRevenue(stats.total_revenue)}
              icon={DollarSign}
            />
            <KpiCard
              title="Active Products"
              value={stats.active_products.toLocaleString()}
              subtitle={`${stats.pending_verifications} pending verifications`}
              icon={PackageCheck}
            />
          </>
        ) : null}
      </div>

      {/* Performance chart */}
      <PerformanceChart />

      {/* Alerts + Activity side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CriticalAlerts />
        <ActivityFeed />
      </div>

    </div>
  )
}
