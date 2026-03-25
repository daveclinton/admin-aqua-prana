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
import { cn } from "@/lib/utils"

const dateRanges = ["7D", "30D", "90D", "12M"] as const

const regionData = [
  { region: "Mumbai", farmers: 62, ponds: 186, score: 7.4, scoreColor: "text-emerald-600", gmv: "3.1L", alertRate: "4%", alertTag: "border-emerald-200 bg-emerald-50 text-emerald-700", alertLabel: "Low", trend: "+0.6", trendDir: "up" },
  { region: "Chennai", farmers: 38, ponds: 95, score: 5.8, scoreColor: "text-amber-600", gmv: "1.9L", alertRate: "12%", alertTag: "border-amber-200 bg-amber-50 text-amber-700", alertLabel: "Med", trend: "stable", trendDir: "stable" },
  { region: "Pune", farmers: 29, ponds: 72, score: 8.1, scoreColor: "text-emerald-600", gmv: "1.2L", alertRate: "3%", alertTag: "border-emerald-200 bg-emerald-50 text-emerald-700", alertLabel: "Low", trend: "+1.1", trendDir: "up" },
  { region: "Kolkata", farmers: 24, ponds: 60, score: 3.9, scoreColor: "text-red-600", gmv: "0.8L", alertRate: "28%", alertTag: "border-red-200 bg-red-50 text-red-600", alertLabel: "High", trend: "-1.3", trendDir: "down" },
  { region: "Delhi", farmers: 18, ponds: 44, score: 6.2, scoreColor: "text-amber-600", gmv: "0.6L", alertRate: "9%", alertTag: "border-amber-200 bg-amber-50 text-amber-700", alertLabel: "Med", trend: "+0.3", trendDir: "up" },
] as const

const speciesData = [
  { species: "Shrimp", emoji: "🦐", ponds: 480, score: 5.9, scoreColor: "text-amber-600", mortality: "2.8%", fcr: "1.6", alert: "Med", alertTag: "border-amber-200 bg-amber-50 text-amber-700" },
  { species: "Tilapia", emoji: "🐟", ponds: 520, score: 7.2, scoreColor: "text-emerald-600", mortality: "1.1%", fcr: "1.3", alert: "Low", alertTag: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { species: "Catfish", emoji: "🐠", ponds: 148, score: 7.8, scoreColor: "text-emerald-600", mortality: "0.9%", fcr: "1.4", alert: "Low", alertTag: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { species: "Carp", emoji: "🐡", ponds: 92, score: 4.1, scoreColor: "text-red-600", mortality: "3.4%", fcr: "2.1", alert: "High", alertTag: "border-red-200 bg-red-50 text-red-600" },
] as const

const pondHealthBuckets = [
  { range: "0-3", count: 86, color: "bg-red-500", height: "h-[22%]" },
  { range: "3-5", count: 112, color: "bg-amber-500", height: "h-[28%]" },
  { range: "5-7", count: 468, color: "bg-emerald-400", height: "h-[75%]" },
  { range: "7-9", count: 512, color: "bg-emerald-600", height: "h-[82%]" },
  { range: "9-10", count: 62, color: "bg-emerald-800", height: "h-[16%]" },
] as const

const growthData = [
  { month: "Aug", signups: 18, churned: 2 },
  { month: "Sep", signups: 24, churned: 3 },
  { month: "Oct", signups: 20, churned: 1 },
  { month: "Nov", signups: 28, churned: 4 },
  { month: "Dec", signups: 32, churned: 2 },
  { month: "Jan", signups: 22, churned: 3 },
] as const

const revenueSegments = [
  { label: "Marketplace", value: "5.8L", pct: "69%", color: "bg-emerald-500" },
  { label: "Subscriptions", value: "1.7L", pct: "20%", color: "bg-blue-500" },
  { label: "Services", value: "0.9L", pct: "11%", color: "bg-amber-500" },
] as const

const exportItems = [
  { label: "Farmer List", formats: ["CSV", "XLSX"] },
  { label: "Monthly Revenue Report", formats: ["PDF", "XLSX"] },
  { label: "Pond Alert History", formats: ["CSV", "PDF"] },
  { label: "Support Ticket Summary", formats: ["PDF", "CSV"] },
  { label: "AquaGPT Usage Report", formats: ["PDF", "CSV"] },
] as const

const filterChips = ["All Regions", "Pro Plan Only", "Active Only", "Has Alerts"] as const

export function AnalyticsClient() {
  const [activeRange, setActiveRange] = useState<string>("30D")

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
        <KpiCard title="Total Ponds" value="1,240" icon={Waves} variant="green" trend="+48 this month" />
        <KpiCard title="Active Farmers" value="200" icon={Users} variant="teal" trend="+22 this month" />
        <KpiCard title="GMV This Month" value="₹8.4L" icon={BarChart3} variant="green" trend="+18% vs last" />
        <KpiCard title="Avg Pondscore" value="6.8" icon={Activity} variant="default" trend="→ stable" />
        <KpiCard title="AquaGPT Accuracy" value="94.2%" icon={Zap} variant="amber" trend="+2.1% this week" />
      </div>

      {/* Row 1: Growth Cohorts + Revenue Breakdown */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Farmer Growth Cohorts */}
        <Card className="rounded-2xl border border-border/80">
          <CardHeader>
            <CardTitle>Farmer Growth Cohorts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chart placeholder - area chart */}
            <div className="relative h-48 rounded-xl bg-gradient-to-t from-emerald-50 to-transparent border border-border/60 overflow-hidden">
              <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
                {growthData.map((d) => (
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
                +22 new
              </span>
              <span className="flex items-center gap-1 text-red-500">
                <TrendingDown className="size-3.5" />
                -3 churned
              </span>
              <span className="text-muted-foreground">86% retention</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="rounded-2xl border border-border/80">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <p className="text-lg font-bold">₹8.4L</p>
                  <p className="text-[10px] text-muted-foreground">Total GMV</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6">
              {revenueSegments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2 text-xs">
                  <span className={cn("size-2.5 rounded-full", seg.color)} />
                  <span className="text-muted-foreground">{seg.label}</span>
                  <span className="font-semibold">₹{seg.value} · {seg.pct}</span>
                </div>
              ))}
            </div>
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
            <Table>
              <TableHeader className="bg-[#f1f5ef]">
                <TableRow className="hover:bg-[#f1f5ef]">
                  <TableHead className="px-6">Region</TableHead>
                  <TableHead>Farmers</TableHead>
                  <TableHead>Ponds</TableHead>
                  <TableHead>Avg Pondscore</TableHead>
                  <TableHead>GMV (₹)</TableHead>
                  <TableHead>Alert Rate</TableHead>
                  <TableHead className="px-6">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionData.map((row) => (
                  <TableRow key={row.region}>
                    <TableCell className="px-4 font-medium">{row.region}</TableCell>
                    <TableCell>{row.farmers}</TableCell>
                    <TableCell>{row.ponds}</TableCell>
                    <TableCell>
                      <span className={cn("font-semibold", row.scoreColor)}>
                        {row.score}
                      </span>
                    </TableCell>
                    <TableCell>₹{row.gmv}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("rounded-full px-2.5 py-1", row.alertTag)}
                      >
                        {row.alertLabel} {row.alertRate}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          row.trendDir === "up" ? "text-emerald-600" :
                          row.trendDir === "down" ? "text-red-500" :
                          "text-muted-foreground"
                        )}
                      >
                        {row.trendDir === "up" && "↑ "}{row.trendDir === "down" && "↓ "}{row.trend}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pond Health Distribution */}
        <Card className="rounded-2xl border border-border/80">
          <CardHeader>
            <CardTitle>Pond Health Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-48 items-end justify-around gap-3 rounded-xl border border-border/60 bg-muted/30 px-6 pb-4 pt-8">
              {pondHealthBuckets.map((bucket) => (
                <div key={bucket.range} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-semibold">{bucket.count}</span>
                  <div className={cn("w-full max-w-[48px] rounded-t-md", bucket.color, bucket.height)} />
                  <span className="text-[10px] text-muted-foreground">{bucket.range}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-500" /> 86 Critical</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" /> 112 Low</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-400" /> 468 Medium</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-600" /> 574 Good+</span>
            </div>
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
            <Table>
              <TableHeader className="bg-[#f1f5ef]">
                <TableRow className="hover:bg-[#f1f5ef]">
                  <TableHead className="px-6">Species</TableHead>
                  <TableHead>Ponds</TableHead>
                  <TableHead>Avg Pondscore</TableHead>
                  <TableHead>Avg Mortality %</TableHead>
                  <TableHead>Avg Feed FCR</TableHead>
                  <TableHead className="px-6">Alert Freq</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {speciesData.map((row) => (
                  <TableRow key={row.species}>
                    <TableCell className="px-4 font-medium">
                      {row.emoji} {row.species}
                    </TableCell>
                    <TableCell>{row.ponds}</TableCell>
                    <TableCell>
                      <span className={cn("font-semibold", row.scoreColor)}>
                        {row.score}
                      </span>
                    </TableCell>
                    <TableCell>{row.mortality}</TableCell>
                    <TableCell>{row.fcr}</TableCell>
                    <TableCell className="px-6">
                      <Badge
                        variant="outline"
                        className={cn("rounded-full px-2.5 py-1", row.alertTag)}
                      >
                        {row.alert}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* AquaGPT Usage Trends */}
        <Card className="rounded-2xl border border-border/80">
          <CardHeader>
            <CardTitle>AquaGPT Usage Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Line chart placeholder */}
            <div className="relative h-48 rounded-xl border border-border/60 bg-gradient-to-t from-violet-50/50 to-transparent overflow-hidden">
              <svg viewBox="0 0 300 120" className="absolute inset-0 size-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,100 L50,90 L100,75 L150,65 L200,45 L250,30 L300,20 L300,120 L0,120 Z" fill="url(#gptGrad)" />
                <polyline points="0,100 50,90 100,75 150,65 200,45 250,30 300,20" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="300" cy="20" r="4" fill="#8b5cf6" />
              </svg>
              <div className="absolute right-3 top-3 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                17.2K/mo
              </div>
              <div className="absolute bottom-3 left-0 flex w-full justify-around px-4 text-[10px] text-muted-foreground">
                <span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border p-3">
                <p className="text-lg font-bold text-violet-600">17,250</p>
                <p className="text-[10px] text-muted-foreground">queries/mo</p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="text-lg font-bold text-emerald-600">94.2%</p>
                <p className="text-[10px] text-muted-foreground">resolved by AI</p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="text-lg font-bold text-red-500">34</p>
                <p className="text-[10px] text-muted-foreground">escalated</p>
              </div>
            </div>
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
