"use client"

import { useState } from "react"
import {
  Check,
  ChevronDown,
  CreditCard,
  Download,
  FileText,
  RefreshCw,
  Search,
  Send,
  Settings,
} from "lucide-react"
import { parseAsStringLiteral, useQueryState } from "nuqs"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { cn } from "@/lib/utils"

const billingTabs = ["subscriptions", "invoices", "plan-config"] as const
type BillingTab = (typeof billingTabs)[number]

const subscriptions = [
  { farmer: "XYZ Farmer", plan: "Pro", planColor: "border-blue-200 bg-blue-50 text-blue-700", amount: "₹999/mo", cycle: "Monthly", renewal: "Mar 15, 2026", status: "Active", statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700", actions: ["Manage"] },
  { farmer: "Suresh Kumar", plan: "Free", planColor: "border-slate-200 bg-slate-50 text-slate-600", amount: "₹0", cycle: "—", renewal: "—", status: "Active", statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700", actions: ["Upgrade"] },
  { farmer: "Priya R", plan: "Enterprise", planColor: "border-violet-200 bg-violet-50 text-violet-700", amount: "₹4,999/mo", cycle: "Annual", renewal: "Dec 1, 2026", status: "Active", statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700", actions: ["Manage"] },
  { farmer: "Ravi Pond", plan: "Pro", planColor: "border-blue-200 bg-blue-50 text-blue-700", amount: "₹999/mo", cycle: "Monthly", renewal: "Feb 10 · OVERDUE", status: "Overdue", statusColor: "border-red-200 bg-red-50 text-red-600", actions: ["Remind", "Suspend"] },
  { farmer: "bce Farmer", plan: "Pro", planColor: "border-blue-200 bg-blue-50 text-blue-700", amount: "₹999/mo", cycle: "Monthly", renewal: "SUSPENDED", status: "Suspended", statusColor: "border-red-200 bg-red-50 text-red-600", actions: ["Reactivate"] },
] as const

const invoices = [
  { id: "INV-2026-0218", farmer: "XYZ Farmer", plan: "Pro", period: "Feb 15–Mar 15", amount: "₹999", issued: "Feb 15", due: "Mar 15", status: "Paid", statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700", actions: ["PDF", "Resend"] },
  { id: "INV-2026-0217", farmer: "Priya R", plan: "Enterprise", period: "Feb 1–Feb 28", amount: "₹4,999", issued: "Feb 1", due: "Feb 28", status: "Paid", statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700", actions: ["PDF", "Resend"] },
  { id: "INV-2026-0214", farmer: "Ravi Pond", plan: "Pro", period: "Jan 10–Feb 10", amount: "₹999", issued: "Jan 10", due: "Feb 10 OVERDUE", status: "Overdue", statusColor: "border-red-200 bg-red-50 text-red-600", actions: ["PDF", "Remind"] },
  { id: "INV-2026-0201", farmer: "bce Farmer", plan: "Pro", period: "Jan 1–Feb 1", amount: "₹999", issued: "Jan 1", due: "Feb 1", status: "Void", statusColor: "border-slate-200 bg-slate-50 text-slate-600", actions: ["PDF", "Write-off"] },
  { id: "INV-2026-0188", farmer: "XYZ Farmer", plan: "Pro", period: "Jan 15–Feb 15", amount: "₹999", issued: "Jan 15", due: "Feb 15", status: "Paid", statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700", actions: ["PDF", "Refund"] },
  { id: "INV-2026-0175", farmer: "Suresh Kumar", plan: "Free", period: "Jan 2026", amount: "₹0", issued: "Jan 1", due: "—", status: "Free", statusColor: "border-slate-200 bg-slate-50 text-slate-600", actions: ["PDF"] },
] as const

const plans = [
  {
    name: "Free",
    price: "₹0",
    features: ["1 pond", "AquaGPT 10 queries/mo", "No alerts"],
    farmers: 52,
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹999/mo",
    features: ["5 ponds", "Unlimited AquaGPT", "Full alerts", "Marketplace"],
    farmers: 98,
    highlight: true,
    tag: "Most popular",
  },
  {
    name: "Enterprise",
    price: "₹4,999/mo",
    features: ["Unlimited ponds", "API access", "Dedicated support", "Custom reports"],
    farmers: 50,
    highlight: false,
  },
] as const

const planConfigs = [
  { name: "Free", price: "₹0/mo", ponds: "1 pond", queries: "10 / month", alerts: "None" },
  { name: "Pro", price: "₹999/mo", ponds: "5 ponds", queries: "Unlimited", alerts: "Full alerts + Marketplace" },
  { name: "Enterprise", price: "₹4,999/mo", ponds: "Unlimited ponds", queries: "Unlimited + API access", alerts: "Dedicated support + Custom reports" },
] as const

export function BillingClient() {
  const [workspace, setWorkspace] = useQueryState(
    "tab",
    parseAsStringLiteral(billingTabs).withDefault("subscriptions")
  )

  const currentTab = workspace ?? "subscriptions"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Billing & Subscriptions</h2>
          <p className="text-sm text-muted-foreground">
            Manage subscriptions, invoices, and plan configuration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full">
            <Settings className="size-3.5" />
            Edit Plans
          </Button>
          <Button variant="outline" className="rounded-full">
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(value) => void setWorkspace(value as BillingTab)}
      >
        <TabsList variant="line" className="border-b pb-1">
          <TabsTrigger value="subscriptions" className="gap-1.5">
            <CreditCard className="size-3.5" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-1.5">
            <FileText className="size-3.5" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="plan-config" className="gap-1.5">
            <Settings className="size-3.5" />
            Plan Config
          </TabsTrigger>
        </TabsList>

        {/* SUBSCRIPTIONS TAB */}
        <TabsContent value="subscriptions" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            <KpiCard title="MRR" value="₹2.8L" icon={CreditCard} variant="green" trend="+9% this month" />
            <KpiCard title="Active Paid" value="148" icon={Check} variant="default" />
            <KpiCard title="Overdue" value="12" icon={CreditCard} variant="amber" />
            <KpiCard title="Suspended" value="3" icon={CreditCard} variant="red" />
            <KpiCard title="Free Tier" value="52" icon={CreditCard} variant="teal" />
          </div>

          <Card className="rounded-2xl border border-border/80">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle>Subscriptions</CardTitle>
                <div className="flex flex-col gap-2 lg:flex-row">
                  <div className="relative min-w-[220px]">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search farmer..." className="h-8 rounded-full pl-8" />
                  </div>
                  {["All Plans", "All Statuses"].map((filter) => (
                    <Button key={filter} variant="outline" className="h-8 justify-between rounded-full px-3">
                      {filter}
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader className="bg-[#f1f5ef]">
                  <TableRow className="hover:bg-[#f1f5ef]">
                    <TableHead className="px-6">Farmer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Next Renewal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>History</TableHead>
                    <TableHead className="px-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.farmer}>
                      <TableCell className="px-4 font-medium">{sub.farmer}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", sub.planColor)}>
                          {sub.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>{sub.amount}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.cycle}</TableCell>
                      <TableCell>
                        <span className={cn(sub.status === "Overdue" || sub.status === "Suspended" ? "text-red-600 font-medium" : "text-muted-foreground")}>
                          {sub.renewal}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", sub.statusColor)}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                          History
                        </Button>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex gap-2">
                          {sub.actions.map((action) => (
                            <Button
                              key={action}
                              variant="outline"
                              size="sm"
                              className={cn(
                                "rounded-full",
                                action === "Suspend" && "border-red-200 bg-red-50 text-red-600",
                                action === "Reactivate" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                                action === "Remind" && "border-amber-200 bg-amber-50 text-amber-700"
                              )}
                            >
                              {action}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t px-6 py-4 text-xs text-muted-foreground">
                <span>Showing 5 of 200</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 rounded-full px-3" disabled>Previous</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-full px-3">Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "rounded-2xl border py-0",
                  plan.highlight && "border-emerald-300 ring-1 ring-emerald-200"
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    {"tag" in plan && plan.tag && (
                      <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        {plan.tag}
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold">{plan.price}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="size-3.5 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    {plan.farmers} farmers on this plan
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* INVOICES TAB */}
        <TabsContent value="invoices" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Collected This Month" value="₹8.4L" icon={CreditCard} variant="green" trend="+11% vs last" />
            <KpiCard title="Outstanding" value="₹11,988" icon={CreditCard} variant="amber" subtitle="12 overdue invoices" />
            <KpiCard title="Write-Offs YTD" value="₹1,998" icon={CreditCard} variant="red" />
            <KpiCard title="Total Invoices" value="218" icon={FileText} variant="default" />
          </div>

          <Card className="rounded-2xl border border-border/80">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle>All Invoices</CardTitle>
                <div className="flex flex-col gap-2 lg:flex-row">
                  <div className="relative min-w-[220px]">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search invoice # or farmer..." className="h-8 rounded-full pl-8" />
                  </div>
                  {["All Statuses", "All Plans", "All Time"].map((filter) => (
                    <Button key={filter} variant="outline" className="h-8 justify-between rounded-full px-3">
                      {filter}
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader className="bg-[#f1f5ef]">
                  <TableRow className="hover:bg-[#f1f5ef]">
                    <TableHead className="px-6">Invoice #</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="px-4 font-mono text-xs font-medium">{inv.id}</TableCell>
                      <TableCell className="font-medium">{inv.farmer}</TableCell>
                      <TableCell>{inv.plan}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.period}</TableCell>
                      <TableCell className="font-medium">{inv.amount}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.issued}</TableCell>
                      <TableCell>
                        <span className={cn(inv.status === "Overdue" ? "text-red-600 font-medium" : "text-muted-foreground")}>
                          {inv.due}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", inv.statusColor)}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex gap-2">
                          {inv.actions.map((action) => (
                            <Button
                              key={action}
                              variant="outline"
                              size="sm"
                              className={cn(
                                "rounded-full text-[0.625rem]",
                                action === "Remind" && "border-amber-200 bg-amber-50 text-amber-700"
                              )}
                            >
                              {action}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t px-6 py-4 text-xs text-muted-foreground">
                <span>Showing 6 of 218 invoices</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 rounded-full px-3" disabled>Previous</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-full px-3">Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Summary + Bulk Actions */}
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl border border-border/80">
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Total invoiced", value: "₹8,41,218", color: "" },
                  { label: "Collected", value: "₹8,29,230 · 98.6%", color: "text-emerald-600" },
                  { label: "Outstanding", value: "₹11,988", color: "text-amber-600" },
                  { label: "Refunded", value: "₹0", color: "" },
                  { label: "GST collected (18%)", value: "₹1,49,261", color: "" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between border-b border-border/60 pb-2 text-sm last:border-b-0 last:pb-0">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={cn("font-medium", item.color)}>{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/80">
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: Send, label: "Send reminders to all overdue (12)", color: "" },
                  { icon: Download, label: "Export all invoices as CSV", color: "" },
                  { icon: Download, label: "Download invoice ZIP — Feb 2026", color: "" },
                  { icon: RefreshCw, label: "Retry failed payments (3)", color: "" },
                ].map((item) => (
                  <Button
                    key={item.label}
                    variant="outline"
                    className="w-full justify-start gap-2 rounded-xl px-5 py-3 text-sm"
                  >
                    <item.icon className="size-4 text-muted-foreground" />
                    {item.label}
                  </Button>
                ))}
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-emerald-700">Razorpay connected · Test Mode</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PLAN CONFIG TAB */}
        <TabsContent value="plan-config" className="space-y-6 pt-4">
          <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <Settings className="size-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Plan Configuration</p>
                <p className="text-xs text-blue-700">View and manage subscription plan details, limits, and pricing.</p>
              </div>
            </div>
            <Button className="rounded-full bg-[#1b4332] text-white hover:bg-[#244d39]">
              + Create New Plan
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {planConfigs.map((plan) => (
              <Card key={plan.name} className="rounded-2xl border border-border/80">
                <CardHeader>
                  <CardTitle className="text-base">{plan.name} Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Price", value: plan.price },
                    { label: "Ponds Limit", value: plan.ponds },
                    { label: "AquaGPT Queries", value: plan.queries },
                    { label: "Features", value: plan.alerts },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full rounded-full">
                    Edit Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
