"use client"

import { useState } from "react"
import {
  Activity,
  BarChart3,
  ChevronDown,
  Download,
  FileText,
  TrendingDown,
  TrendingUp,
  Users,
  Waves,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  useOverviewStats,
  usePondAnalytics,
  useAquagptAnalytics,
  useMarketplaceAnalytics,
} from "@/features/analytics/hooks/use-analytics"

const dateRanges = ["7D", "30D", "90D", "12M"] as const

const exportItems = [
  { label: "Farmer List", formats: ["CSV", "XLSX"] },
  { label: "Monthly Revenue Report", formats: ["PDF", "XLSX"] },
  { label: "Pond Alert History", formats: ["CSV", "PDF"] },
  { label: "Support Ticket Summary", formats: ["PDF", "CSV"] },
  { label: "AquaGPT Usage Report", formats: ["PDF", "CSV"] },
] as const

const filterChips = ["All Regions", "Pro Plan Only", "Active Only", "Has Alerts"] as const

/* ── helpers ── */

function formatLakhs(value: number): string {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return String(value)
}

function scoreColor(score: number): string {
  if (score >= 7) return "text-emerald-600"
  if (score >= 5) return "text-amber-600"
  return "text-red-600"
}

function alertRateTag(rate: number): { label: string; className: string } {
  if (rate < 5) return { label: "Low", className: "border-emerald-200 bg-emerald-50 text-emerald-700" }
  if (rate <= 15) return { label: "Med", className: "border-amber-200 bg-amber-50 text-amber-700" }
  return { label: "High", className: "border-red-200 bg-red-50 text-red-600" }
}

function alertFreqTag(freq: string): string {
  const f = freq.toLowerCase()
  if (f === "high") return "border-red-200 bg-red-50 text-red-600"
  if (f === "med" || f === "medium") return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-emerald-200 bg-emerald-50 text-emerald-700"
}

function healthBarColor(range: string): string {
  if (range.startsWith("0")) return "bg-red-500"
  if (range.startsWith("3")) return "bg-amber-500"
  if (range.startsWith("5")) return "bg-emerald-400"
  if (range.startsWith("7")) return "bg-emerald-600"
  return "bg-emerald-800"
}

export function AnalyticsClient() {
  const [activeRange, setActiveRange] = useState<string>("30D")

  const overviewStats = useOverviewStats()
  const pondAnalytics = usePondAnalytics(activeRange)
  const aquagptAnalytics = useAquagptAnalytics(activeRange)
  const marketplaceAnalytics = useMarketplaceAnalytics(activeRange)

  const isKpiLoading =
    overviewStats.isLoading ||
    pondAnalytics.isLoading ||
    aquagptAnalytics.isLoading ||
    marketplaceAnalytics.isLoading

  /* ── derived data ── */

  const totalPonds = pondAnalytics.data?.overview?.total_ponds
  const activeFarmers = overviewStats.data?.total_farmers
  const gmvThisMonth = marketplaceAnalytics.data?.summary?.revenue_in_range
  const avgPondscore = pondAnalytics.data?.overview?.avg_pondscore

  const aquaSummary = aquagptAnalytics.data?.summary
  const aquaAccuracy =
    aquaSummary && aquaSummary.chats_in_range > 0
      ? ((aquaSummary.resolutions / aquaSummary.chats_in_range) * 100).toFixed(1)
      : undefined

  const growthCohorts: { month: string; signups: number; churned: number }[] =
    pondAnalytics.data?.growth_cohorts ?? []

  const lastCohort = growthCohorts.length > 0 ? growthCohorts[growthCohorts.length - 1] : null

  const marketSummary = marketplaceAnalytics.data?.summary
  const totalRevenue = marketSummary?.total_revenue
  const revenueInRange = marketSummary?.revenue_in_range

  const regions = pondAnalytics.data?.regions ?? []

  const healthDist: { range: string; count: number }[] =
    pondAnalytics.data?.health_distribution ?? []
  const maxHealthCount = healthDist.length > 0 ? Math.max(...healthDist.map((h) => h.count)) : 1

  const species = pondAnalytics.data?.species ?? []

  const dailyUsage = aquagptAnalytics.data?.daily_usage ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Platform metrics, farmer insights, and performance trends.
          </p>
        </div>
        <Button variant="outline" className="rounded-full">
          <Download className="size-3.5" />
          Export Report
        </Button>
      </div>

      {/* Date range picker */}
      <div className="flex flex-wrap items-center gap-2">
        {dateRanges.map((range) => (
          <Button
            key={range}
            variant={activeRange === range ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8 rounded-full px-4",
              activeRange === range && "bg-[#1b4332] text-white hover:bg-[#244d39]"
            )}
            onClick={() => setActiveRange(range)}
          >
            {range}
          </Button>
        ))}
        <Button variant="outline" size="sm" className="h-8 rounded-full px-4">
          Custom
          <ChevronDown className="ml-1 size-3.5" />
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {isKpiLoading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-2xl" />
            ))}
          </>
        ) : (
          <>
            <KpiCard
              title="Total Ponds"
              value={totalPonds != null ? totalPonds.toLocaleString() : "--"}
              icon={Waves}
              variant="green"
            />
            <KpiCard
              title="Active Farmers"
              value={activeFarmers != null ? activeFarmers.toLocaleString() : "--"}
              icon={Users}
              variant="teal"
            />
            <KpiCard
              title="GMV This Month"
              value={gmvThisMonth != null ? `\u20B9${formatLakhs(gmvThisMonth)}` : "--"}
              icon={BarChart3}
              variant="green"
            />
            <KpiCard
              title="Avg Pondscore"
              value={avgPondscore != null ? String(avgPondscore) : "--"}
              icon={Activity}
              variant="default"
            />
            <KpiCard
              title="AquaGPT Accuracy"
              value={aquaAccuracy != null ? `${aquaAccuracy}%` : "--"}
              icon={Zap}
              variant="amber"
            />
          </>
        )}
      </div>

      {/* Row 1: Growth Cohorts + Revenue Breakdown */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Farmer Growth Cohorts */}
        <Card className="rounded-2xl border border-border/80">
          <CardHeader>
            <CardTitle>Farmer Growth Cohorts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pondAnalytics.isLoading ? (
              <Skeleton className="h-48 rounded-xl" />
            ) : growthCohorts.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-sm text-muted-foreground">
                No cohort data available
              </div>
            ) : (
              <>
                {/* Chart placeholder - area chart */}
                <div className="relative h-48 rounded-xl bg-gradient-to-t from-emerald-50 to-transparent border border-border/60 overflow-hidden">
                  <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
                    {growthCohorts.map((d) => (
                      <div key={d.month} className="flex flex-col items-center gap-1">
                        <div
                          className="w-8 rounded-t-md bg-emerald-400/70"
                          style={{ height: `${d.signups * 4}px` }}
                        />
                        <span className="text-[10px] text-muted-foreground">{d.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1">
                      <span className="size-2 rounded-full bg-emerald-500" /> New signups
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-2 rounded-full bg-red-400" /> Churned
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="size-3.5" />
                    +{lastCohort?.signups ?? 0} new
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <TrendingDown className="size-3.5" />
                    -{lastCohort?.churned ?? 0} churned
                  </span>
                  <span className="text-muted-foreground">
                    {lastCohort && lastCohort.signups > 0
                      ? `${Math.round(((lastCohort.signups - lastCohort.churned) / lastCohort.signups) * 100)}% retention`
                      : "--"}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="rounded-2xl border border-border/80">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketplaceAnalytics.isLoading ? (
              <>
                <div className="flex items-center justify-center py-4">
                  <Skeleton className="size-44 rounded-full" />
                </div>
                <Skeleton className="h-5 w-full" />
              </>
            ) : (
              <>
                {/* Donut chart placeholder */}
                <div className="flex items-center justify-center py-4">
                  <div className="relative flex size-44 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="173.4 251.3" strokeDashoffset="0" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="50.3 251.3" strokeDashoffset="-173.4" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="27.6 251.3" strokeDashoffset="-223.7" strokeLinecap="round" />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-lg font-bold">
                        {totalRevenue != null ? `\u20B9${formatLakhs(totalRevenue)}` : "--"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Total GMV</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-6">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={cn("size-2.5 rounded-full", "bg-emerald-500")} />
                    <span className="text-muted-foreground">Revenue in Range</span>
                    <span className="font-semibold">
                      {revenueInRange != null ? `\u20B9${formatLakhs(revenueInRange)}` : "--"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={cn("size-2.5 rounded-full", "bg-blue-500")} />
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-semibold">
                      {totalRevenue != null ? `\u20B9${formatLakhs(totalRevenue)}` : "--"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Region Performance + Pond Health */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Performance by Region */}
        <Card className="rounded-2xl border border-border/80">
          <CardHeader>
            <CardTitle>Performance by Region</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {pondAnalytics.isLoading ? (
              <div className="space-y-3 px-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : regions.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No region data available
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-[#f1f5ef]">
                  <TableRow className="hover:bg-[#f1f5ef]">
                    <TableHead className="px-6">Region</TableHead>
                    <TableHead>Farmers</TableHead>
                    <TableHead>Ponds</TableHead>
                    <TableHead>Avg Pondscore</TableHead>
                    <TableHead>Alert Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.map((row) => {
                    const tag = alertRateTag(row.alert_rate)
                    return (
                      <TableRow key={row.region}>
                        <TableCell className="px-4 font-medium">{row.region}</TableCell>
                        <TableCell>{row.farmers}</TableCell>
                        <TableCell>{row.ponds}</TableCell>
                        <TableCell>
                          <span className={cn("font-semibold", scoreColor(row.avg_pondscore ?? 0))}>
                            {row.avg_pondscore ?? "--"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("rounded-full px-2.5 py-1", tag.className)}
                          >
                            {tag.label} {row.alert_rate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pond Health Distribution */}
        <Card className="rounded-2xl border border-border/80">
          <CardHeader>
            <CardTitle>Pond Health Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pondAnalytics.isLoading ? (
              <Skeleton className="h-48 rounded-xl" />
            ) : healthDist.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-sm text-muted-foreground">
                No health distribution data available
              </div>
            ) : (
              <>
                <div className="flex h-48 items-end justify-around gap-3 rounded-xl border border-border/60 bg-muted/30 px-6 pb-4 pt-8">
                  {healthDist.map((bucket) => {
                    const pct = Math.round((bucket.count / maxHealthCount) * 100)
                    return (
                      <div key={bucket.range} className="flex flex-1 flex-col items-center gap-2">
                        <span className="text-xs font-semibold">{bucket.count}</span>
                        <div
                          className={cn("w-full max-w-[48px] rounded-t-md", healthBarColor(bucket.range))}
                          style={{ height: `${pct}%` }}
                        />
                        <span className="text-[10px] text-muted-foreground">{bucket.range}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  {healthDist.map((bucket) => (
                    <span key={bucket.range} className="flex items-center gap-1">
                      <span className={cn("size-2 rounded-full", healthBarColor(bucket.range))} />
                      {bucket.count} ({bucket.range})
                    </span>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Species Performance + AquaGPT Usage */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Species Performance */}
        <Card className="rounded-2xl border border-border/80">
          <CardHeader>
            <CardTitle>Species Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {pondAnalytics.isLoading ? (
              <div className="space-y-3 px-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : species.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No species data available
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-[#f1f5ef]">
                  <TableRow className="hover:bg-[#f1f5ef]">
                    <TableHead className="px-6">Species</TableHead>
                    <TableHead>Ponds</TableHead>
                    <TableHead>Avg Pondscore</TableHead>
                    <TableHead className="px-6">Alert Freq</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {species.map((row) => (
                    <TableRow key={row.species}>
                      <TableCell className="px-4 font-medium">
                        {row.species}
                      </TableCell>
                      <TableCell>{row.ponds}</TableCell>
                      <TableCell>
                        <span className={cn("font-semibold", scoreColor(row.avg_pondscore ?? 0))}>
                          {row.avg_pondscore ?? "--"}
                        </span>
                      </TableCell>
                      <TableCell className="px-6">
                        <Badge
                          variant="outline"
                          className={cn("rounded-full px-2.5 py-1", alertFreqTag(row.alert_frequency))}
                        >
                          {row.alert_frequency}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* AquaGPT Usage Trends */}
        <Card className="rounded-2xl border border-border/80">
          <CardHeader>
            <CardTitle>AquaGPT Usage Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aquagptAnalytics.isLoading ? (
              <>
                <Skeleton className="h-48 rounded-xl" />
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-[72px] rounded-xl" />
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Line chart placeholder */}
                <div className="relative h-48 rounded-xl border border-border/60 bg-gradient-to-t from-violet-50/50 to-transparent overflow-hidden">
                  <svg viewBox="0 0 300 120" className="absolute inset-0 size-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gptGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {dailyUsage.length > 1 ? (() => {
                      const maxVal = Math.max(...dailyUsage.map((d) => d.chats), 1)
                      const step = 300 / (dailyUsage.length - 1)
                      const points = dailyUsage
                        .map((d, i) => `${i * step},${120 - (d.chats / maxVal) * 100}`)
                        .join(" ")
                      const lastPt = dailyUsage[dailyUsage.length - 1]
                      const lastX = (dailyUsage.length - 1) * step
                      const lastY = 120 - (lastPt.chats / maxVal) * 100
                      return (
                        <>
                          <path d={`M${points.split(" ").join(" L")} L300,120 L0,120 Z`} fill="url(#gptGrad)" />
                          <polyline points={points} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx={lastX} cy={lastY} r="4" fill="#8b5cf6" />
                        </>
                      )
                    })() : (
                      <>
                        <path d="M0,100 L50,90 L100,75 L150,65 L200,45 L250,30 L300,20 L300,120 L0,120 Z" fill="url(#gptGrad)" />
                        <polyline points="0,100 50,90 100,75 150,65 200,45 250,30 300,20" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="300" cy="20" r="4" fill="#8b5cf6" />
                      </>
                    )}
                  </svg>
                  <div className="absolute right-3 top-3 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                    {aquaSummary?.chats_in_range != null
                      ? `${(aquaSummary.chats_in_range / 1000).toFixed(1)}K/mo`
                      : "--"}
                  </div>
                  <div className="absolute bottom-3 left-0 flex w-full justify-around px-4 text-[10px] text-muted-foreground">
                    {dailyUsage.length > 0
                      ? dailyUsage
                          .filter((_, i) => i % Math.max(1, Math.floor(dailyUsage.length / 6)) === 0)
                          .slice(0, 6)
                          .map((d) => <span key={d.date}>{d.date}</span>)
                      : <>
                          <span>--</span><span>--</span><span>--</span><span>--</span><span>--</span><span>--</span>
                        </>
                    }
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border p-3">
                    <p className="text-lg font-bold text-violet-600">
                      {aquaSummary?.chats_in_range != null
                        ? aquaSummary.chats_in_range.toLocaleString()
                        : "--"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">queries/mo</p>
                  </div>
                  <div className="rounded-xl border p-3">
                    <p className="text-lg font-bold text-emerald-600">
                      {aquaAccuracy != null ? `${aquaAccuracy}%` : "--"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">resolved by AI</p>
                  </div>
                  <div className="rounded-xl border p-3">
                    <p className="text-lg font-bold text-red-500">
                      {aquaSummary?.escalated_count != null
                        ? aquaSummary.escalated_count
                        : "--"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">escalated</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Builder & Data Export */}
      <Card className="rounded-2xl border border-border/80">
        <CardHeader>
          <CardTitle>Report Builder & Data Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Quick Export */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Quick Export</h3>
              <div className="space-y-3">
                {exportItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex gap-2">
                      {item.formats.map((fmt) => (
                        <Button
                          key={fmt}
                          variant="outline"
                          size="sm"
                          className="h-7 rounded-full px-3 text-[0.625rem]"
                        >
                          {fmt}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Report Builder */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Custom Report Builder</h3>
              <div className="space-y-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Data Source</label>
                  <Button variant="outline" className="h-9 justify-between rounded-lg">
                    Select data source...
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                    <Input type="date" className="h-9 rounded-lg" />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">End Date</label>
                    <Input type="date" className="h-9 rounded-lg" />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Filters</label>
                  <div className="flex flex-wrap gap-2">
                    {filterChips.map((chip) => (
                      <Badge
                        key={chip}
                        variant="outline"
                        className="rounded-full px-3 py-1.5"
                      >
                        {chip}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button className="w-full rounded-lg bg-[#1b4332] text-white hover:bg-[#244d39]">
                  <Download className="size-3.5" />
                  Generate Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
