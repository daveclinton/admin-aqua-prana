"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Bot,
  Users,
  Zap,
  Clock,
  AlertTriangle,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { queryKeys } from "@/lib/react-query/query-keys"
import { getAquagptAnalytics } from "@/features/aquagpt/api"

const ranges = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
]

export function AquagptAnalytics() {
  const [range, setRange] = useState("7d")

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.analytics.aquagpt(range),
    queryFn: () => getAquagptAnalytics(range),
  })

  const summary = data?.summary
  const daily = data?.daily ?? []

  const kpis: {
    label: string
    value: string
    subtitle?: string
    icon: typeof Bot
    variant: "teal" | "green" | "amber" | "red"
  }[] = [
    {
      label: "Total Chats",
      value: summary?.total_chats?.toLocaleString() ?? "-",
      subtitle: summary ? `${summary.chats_in_range.toLocaleString()} in range` : undefined,
      icon: Bot,
      variant: "green",
    },
    {
      label: "Unique Users",
      value: summary?.unique_users?.toLocaleString() ?? "-",
      subtitle: summary ? `${summary.unique_users_in_range.toLocaleString()} in range` : undefined,
      icon: Users,
      variant: "teal",
    },
    {
      label: "Total Tokens",
      value: summary?.total_tokens?.toLocaleString() ?? "-",
      subtitle: summary ? `${summary.tokens_in_range.toLocaleString()} in range` : undefined,
      icon: Zap,
      variant: "amber",
    },
    {
      label: "Avg Latency",
      value: summary ? `${Math.round(summary.avg_latency_ms)}ms` : "-",
      icon: Clock,
      variant: "teal",
    },
    {
      label: "Errors",
      value: summary?.total_errors?.toLocaleString() ?? "-",
      icon: AlertTriangle,
      variant: "red",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Analytics</h3>
        <Tabs value={range} onValueChange={setRange}>
          <TabsList className="h-8">
            {ranges.map((r) => (
              <TabsTrigger key={r.value} value={r.value} className="text-xs px-3">
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-2xl" />
            ))
          : kpis.map((kpi) => (
              <KpiCard
                key={kpi.label}
                title={kpi.label}
                value={kpi.value}
                subtitle={kpi.subtitle}
                icon={kpi.icon}
                variant={kpi.variant}
              />
            ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Daily Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : daily.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              No data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="chatsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tickFormatter={(v: string) => {
                    const d = new Date(v)
                    return `${d.getMonth() + 1}/${d.getDate()}`
                  }}
                />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    fontSize: "12px",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--popover))",
                    color: "hsl(var(--popover-foreground))",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="chats"
                  stroke="hsl(var(--primary))"
                  fill="url(#chatsFill)"
                  strokeWidth={2}
                  name="Chats"
                />
                <Area
                  type="monotone"
                  dataKey="unique_users"
                  stroke="hsl(var(--chart-2))"
                  fill="url(#usersFill)"
                  strokeWidth={2}
                  name="Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
