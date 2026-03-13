"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useOverviewTrends } from "@/features/overview/hooks"

const ranges = ["7d", "30d", "90d"] as const

const chartConfig = {
  signups: {
    label: "Signups",
    color: "hsl(var(--chart-1, 220 70% 50%))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-2, 160 60% 45%))",
  },
  chats: {
    label: "AquaGPT",
    color: "hsl(var(--chart-3, 30 80% 55%))",
  },
} satisfies ChartConfig

function mergeTrends(
  signups: { date: string; count: number }[],
  orders: { date: string; count: number }[],
  chats: { date: string; count: number }[]
) {
  const map = new Map<
    string,
    { date: string; signups: number; orders: number; chats: number }
  >()

  for (const s of signups) {
    const key = s.date
    const entry = map.get(key) ?? {
      date: key,
      signups: 0,
      orders: 0,
      chats: 0,
    }
    entry.signups = s.count
    map.set(key, entry)
  }
  for (const o of orders) {
    const key = o.date
    const entry = map.get(key) ?? {
      date: key,
      signups: 0,
      orders: 0,
      chats: 0,
    }
    entry.orders = o.count
    map.set(key, entry)
  }
  for (const c of chats) {
    const key = c.date
    const entry = map.get(key) ?? {
      date: key,
      signups: 0,
      orders: 0,
      chats: 0,
    }
    entry.chats = c.count
    map.set(key, entry)
  }

  return Array.from(map.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function PerformanceChart() {
  const [range, setRange] = useState<(typeof ranges)[number]>("7d")
  const { data, isLoading } = useOverviewTrends(range)

  const chartData = data
    ? mergeTrends(data.signups, data.orders, data.chats)
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance trends</CardTitle>
        <CardAction>
          <div className="flex gap-1">
            {ranges.map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "ghost"}
                size="xs"
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-xs text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-signups)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-signups)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillChats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chats)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-chats)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatDate}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={32}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatDate(value as string)}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="signups"
                type="monotone"
                fill="url(#fillSignups)"
                stroke="var(--color-signups)"
                strokeWidth={2}
              />
              <Area
                dataKey="orders"
                type="monotone"
                fill="url(#fillOrders)"
                stroke="var(--color-orders)"
                strokeWidth={2}
              />
              <Area
                dataKey="chats"
                type="monotone"
                fill="url(#fillChats)"
                stroke="var(--color-chats)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
