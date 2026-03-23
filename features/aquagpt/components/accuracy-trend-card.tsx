"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { queryKeys } from "@/lib/react-query/query-keys"
import { getAccuracyTrend } from "@/features/aquagpt/api"
import { cn } from "@/lib/utils"

export function AccuracyTrendCard({ range }: { range: string }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.aquagpt.accuracy(range),
    queryFn: () => getAccuracyTrend(range),
    staleTime: 60_000,
    retry: 1,
  })

  if (isLoading) return <Skeleton className="h-[260px] rounded-2xl" />

  const points = data?.points ?? []
  const changePct = data?.change_pct ?? 0

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Accuracy Trend</CardTitle>
        {changePct !== 0 && (
          <CardAction>
            <span
              className={cn(
                "text-xs font-semibold",
                changePct > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {changePct > 0 ? "↑" : "↓"} {changePct > 0 ? "+" : ""}
              {changePct.toFixed(1)}% this week
            </span>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
            No accuracy data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={points}>
              <defs>
                <linearGradient id="accFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" className="text-xs" />
              <YAxis
                domain={[80, 100]}
                className="text-xs"
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Accuracy"]}
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
                dataKey="accuracy"
                stroke="hsl(var(--primary))"
                fill="url(#accFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
