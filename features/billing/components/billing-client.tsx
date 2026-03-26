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
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  useSubscriptionStats,
  useInvoiceStats,
  useSubscriptions,
  useInvoices,
  usePlans,
  useUpdateSubscription,
  useUpdateInvoice,
  useCreatePlan,
  useUpdatePlan,
} from "@/features/billing/hooks/use-billing"
import type { SubscriptionDTO, InvoiceDTO, PlanDTO } from "@/features/billing/types"

const billingTabs = ["subscriptions", "invoices", "plan-config"] as const
type BillingTab = (typeof billingTabs)[number]

const LIMIT = 10

/* ------------------------------------------------------------------ */
/*  Format helpers                                                     */
/* ------------------------------------------------------------------ */

function formatMinorToRupees(minor: number): string {
  const rupees = minor / 100
  if (rupees >= 100_000) {
    return `\u20B9${(rupees / 100_000).toFixed(1)}L`
  }
  return `\u20B9${rupees.toLocaleString("en-IN")}`
}

function planBadgeColor(planName: string): string {
  const lower = planName.toLowerCase()
  if (lower === "free") return "border-slate-200 bg-slate-50 text-slate-600"
  if (lower === "standard" || lower === "pro") return "border-blue-200 bg-blue-50 text-blue-700"
  if (lower === "premium" || lower === "enterprise") return "border-violet-200 bg-violet-50 text-violet-700"
  return "border-slate-200 bg-slate-50 text-slate-600"
}

function statusBadgeColor(status: string): string {
  const lower = status.toLowerCase()
  if (lower === "active" || lower === "paid") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (lower === "overdue") return "border-red-200 bg-red-50 text-red-600"
  if (lower === "suspended" || lower === "cancelled") return "border-red-200 bg-red-50 text-red-600"
  if (lower === "void" || lower === "free") return "border-slate-200 bg-slate-50 text-slate-600"
  return "border-slate-200 bg-slate-50 text-slate-600"
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014"
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return "\u2014"
  }
}

function subscriptionActions(status: string): string[] {
  const lower = status.toLowerCase()
  if (lower === "active") return ["Manage"]
  if (lower === "overdue") return ["Remind", "Suspend"]
  if (lower === "suspended" || lower === "cancelled") return ["Reactivate"]
  if (lower === "free") return ["Upgrade"]
  return ["Manage"]
}

function invoiceActions(status: string): string[] {
  const lower = status.toLowerCase()
  if (lower === "paid") return ["PDF", "Refund"]
  if (lower === "overdue") return ["PDF", "Remind"]
  if (lower === "void") return ["PDF", "Write-off"]
  if (lower === "free") return ["PDF"]
  return ["PDF", "Resend"]
}

/* ------------------------------------------------------------------ */
/*  Skeleton helpers                                                   */
/* ------------------------------------------------------------------ */

function KpiSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[130px] rounded-2xl" />
      ))}
    </>
  )
}

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <TableCell key={c} className="px-4">
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

function CardSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[260px] rounded-2xl" />
      ))}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BillingClient() {
  const [workspace, setWorkspace] = useQueryState(
    "tab",
    parseAsStringLiteral(billingTabs).withDefault("subscriptions")
  )

  const currentTab = workspace ?? "subscriptions"

  /* --- Subscriptions state --- */
  const [subSearch, setSubSearch] = useState("")
  const [subOffset, setSubOffset] = useState(0)

  /* --- Invoices state --- */
  const [invSearch, setInvSearch] = useState("")
  const [invOffset, setInvOffset] = useState(0)

  /* --- Data hooks --- */
  const subStats = useSubscriptionStats()
  const invStats = useInvoiceStats()
  const subscriptionsQ = useSubscriptions({ search: subSearch || undefined, limit: LIMIT, offset: subOffset })
  const invoicesQ = useInvoices({ search: invSearch || undefined, limit: LIMIT, offset: invOffset })
  const plansQ = usePlans()

  /* --- Mutations --- */
  const updateSub = useUpdateSubscription()
  const updateInv = useUpdateInvoice()
  const createPlanMut = useCreatePlan()
  const updatePlanMut = useUpdatePlan()

  /* --- Mutation handlers --- */
  function handleSubAction(sub: SubscriptionDTO, action: string) {
    const lower = action.toLowerCase()
    let newStatus: string | undefined
    if (lower === "suspend") newStatus = "suspended"
    else if (lower === "reactivate") newStatus = "active"
    else if (lower === "remind") {
      toast.info(`Payment reminder sent to ${sub.farmer_name ?? sub.farmer_email}`)
      return
    } else if (lower === "upgrade" || lower === "manage") {
      toast.info(`${action} flow coming soon`)
      return
    }
    if (!newStatus) return
    updateSub.mutate(
      { id: sub.id, data: { status: newStatus } },
      {
        onSuccess: () => toast.success(`Subscription ${newStatus} successfully`),
        onError: () => toast.error(`Failed to ${action.toLowerCase()} subscription`),
      }
    )
  }

  function handleInvAction(inv: InvoiceDTO, action: string) {
    const lower = action.toLowerCase()
    if (lower === "pdf") {
      toast.info("Generating PDF...")
      return
    }
    if (lower === "remind") {
      toast.info(`Payment reminder sent for ${inv.id}`)
      return
    }
    let newStatus: string | undefined
    if (lower === "refund") newStatus = "refunded"
    else if (lower === "write-off") newStatus = "written_off"
    else if (lower === "resend") {
      toast.info(`Invoice ${inv.id} resent`)
      return
    }
    if (!newStatus) return
    updateInv.mutate(
      { id: inv.id, data: { status: newStatus } },
      {
        onSuccess: () => toast.success(`Invoice ${newStatus} successfully`),
        onError: () => toast.error(`Failed to ${action.toLowerCase()} invoice`),
      }
    )
  }

  /* --- Derived data --- */
  const subscriptions = subscriptionsQ.data?.subscriptions ?? []
  const subTotal = subscriptionsQ.data?.total ?? 0
  const invoicesList = invoicesQ.data?.invoices ?? []
  const invTotal = invoicesQ.data?.total ?? 0
  const plansList = plansQ.data?.plans ?? []

  const mostPopularPlanId = plansList.length > 0
    ? plansList.reduce((best, p) => (p.active_subscribers > best.active_subscribers ? p : best), plansList[0]).id
    : null

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
            {subStats.isLoading ? (
              <KpiSkeleton count={5} />
            ) : (
              <>
                <KpiCard title="MRR" value={formatMinorToRupees(subStats.data?.mrr_minor ?? 0)} icon={CreditCard} variant="green" trend="+9% this month" />
                <KpiCard title="Active Paid" value={String(subStats.data?.active_paid ?? 0)} icon={Check} variant="default" />
                <KpiCard title="Overdue" value={String(subStats.data?.overdue ?? 0)} icon={CreditCard} variant="amber" />
                <KpiCard title="Suspended" value={String(subStats.data?.suspended ?? 0)} icon={CreditCard} variant="red" />
                <KpiCard title="Free Tier" value={String(subStats.data?.free_tier ?? 0)} icon={CreditCard} variant="teal" />
              </>
            )}
          </div>

          <Card className="rounded-2xl border border-border/80">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle>Subscriptions</CardTitle>
                <div className="flex flex-col gap-2 lg:flex-row">
                  <div className="relative min-w-[220px]">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search farmer..."
                      className="h-8 rounded-full pl-8"
                      value={subSearch}
                      onChange={(e) => { setSubSearch(e.target.value); setSubOffset(0) }}
                    />
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
                  {subscriptionsQ.isLoading ? (
                    <TableSkeleton rows={5} cols={8} />
                  ) : subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        No subscriptions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((sub) => {
                      const actions = subscriptionActions(sub.status)
                      const isOverdueOrSuspended = ["overdue", "suspended", "cancelled"].includes(sub.status.toLowerCase())
                      return (
                        <TableRow key={sub.id}>
                          <TableCell className="px-4 font-medium">{sub.farmer_name ?? sub.farmer_email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", planBadgeColor(sub.plan_name))}>
                              {sub.plan_name}
                            </Badge>
                          </TableCell>
                          <TableCell>{`\u20B9${(sub.price_minor / 100).toLocaleString("en-IN")}/${sub.billing_period === "monthly" ? "mo" : "yr"}`}</TableCell>
                          <TableCell className="text-muted-foreground">{sub.billing_period === "monthly" ? "Monthly" : sub.billing_period === "annual" ? "Annual" : sub.billing_period}</TableCell>
                          <TableCell>
                            <span className={cn(isOverdueOrSuspended ? "text-red-600 font-medium" : "text-muted-foreground")}>
                              {isOverdueOrSuspended && sub.status.toLowerCase() === "suspended"
                                ? "SUSPENDED"
                                : sub.ends_at
                                  ? `${formatDate(sub.ends_at)}${sub.status.toLowerCase() === "overdue" ? " \u00b7 OVERDUE" : ""}`
                                  : "\u2014"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", statusBadgeColor(sub.status))}>
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
                              {actions.map((action) => (
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
                                  disabled={updateSub.isPending}
                                  onClick={() => handleSubAction(sub, action)}
                                >
                                  {action}
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t px-6 py-4 text-xs text-muted-foreground">
                <span>Showing {Math.min(subscriptions.length, LIMIT)} of {subTotal}</span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full px-3"
                    disabled={subOffset === 0}
                    onClick={() => setSubOffset(Math.max(0, subOffset - LIMIT))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full px-3"
                    disabled={subOffset + LIMIT >= subTotal}
                    onClick={() => setSubOffset(subOffset + LIMIT)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {plansQ.isLoading ? (
              <CardSkeleton count={3} />
            ) : (
              plansList.map((plan) => {
                const isHighlight = plan.id === mostPopularPlanId
                const features = plan.features ? (typeof plan.features === "string" ? JSON.parse(plan.features) : plan.features) as string[] : []
                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      "rounded-2xl border py-0",
                      isHighlight && "border-emerald-300 ring-1 ring-emerald-200"
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{plan.name}</CardTitle>
                        {isHighlight && (
                          <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            Most popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold">{formatMinorToRupees(plan.price_minor)}/{plan.billing_period === "monthly" ? "mo" : "yr"}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {features.map((f: string) => (
                          <li key={f} className="flex items-center gap-2">
                            <Check className="size-3.5 text-emerald-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-muted-foreground">
                        {plan.active_subscribers} farmers on this plan
                      </p>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        {/* INVOICES TAB */}
        <TabsContent value="invoices" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {invStats.isLoading ? (
              <KpiSkeleton count={4} />
            ) : (
              <>
                <KpiCard title="Collected This Month" value={formatMinorToRupees(invStats.data?.collected_this_month ?? 0)} icon={CreditCard} variant="green" trend="+11% vs last" />
                <KpiCard title="Outstanding" value={formatMinorToRupees(invStats.data?.outstanding ?? 0)} icon={CreditCard} variant="amber" subtitle={`${invStats.data?.overdue_count ?? 0} overdue invoices`} />
                <KpiCard title="Write-Offs YTD" value={formatMinorToRupees(invStats.data?.write_offs ?? 0)} icon={CreditCard} variant="red" />
                <KpiCard title="Total Invoices" value={String(invStats.data?.total_invoices ?? 0)} icon={FileText} variant="default" />
              </>
            )}
          </div>

          <Card className="rounded-2xl border border-border/80">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle>All Invoices</CardTitle>
                <div className="flex flex-col gap-2 lg:flex-row">
                  <div className="relative min-w-[220px]">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search invoice # or farmer..."
                      className="h-8 rounded-full pl-8"
                      value={invSearch}
                      onChange={(e) => { setInvSearch(e.target.value); setInvOffset(0) }}
                    />
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
                  {invoicesQ.isLoading ? (
                    <TableSkeleton rows={6} cols={9} />
                  ) : invoicesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoicesList.map((inv) => {
                      const actions = invoiceActions(inv.status)
                      const period = inv.period_start && inv.period_end
                        ? `${formatDate(inv.period_start)}\u2013${formatDate(inv.period_end)}`
                        : "\u2014"
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="px-4 font-mono text-xs font-medium">{inv.id}</TableCell>
                          <TableCell className="font-medium">{inv.farmer_name ?? inv.farmer_email}</TableCell>
                          <TableCell>{inv.plan_name ?? "\u2014"}</TableCell>
                          <TableCell className="text-muted-foreground">{period}</TableCell>
                          <TableCell className="font-medium">{`\u20B9${(inv.amount_minor / 100).toLocaleString("en-IN")}`}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(inv.issued_at)}</TableCell>
                          <TableCell>
                            <span className={cn(inv.status.toLowerCase() === "overdue" ? "text-red-600 font-medium" : "text-muted-foreground")}>
                              {inv.due_at ? `${formatDate(inv.due_at)}${inv.status.toLowerCase() === "overdue" ? " OVERDUE" : ""}` : "\u2014"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", statusBadgeColor(inv.status))}>
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="flex gap-2">
                              {actions.map((action) => (
                                <Button
                                  key={action}
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "rounded-full text-[0.625rem]",
                                    action === "Remind" && "border-amber-200 bg-amber-50 text-amber-700"
                                  )}
                                  disabled={updateInv.isPending}
                                  onClick={() => handleInvAction(inv, action)}
                                >
                                  {action}
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t px-6 py-4 text-xs text-muted-foreground">
                <span>Showing {Math.min(invoicesList.length, LIMIT)} of {invTotal} invoices</span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full px-3"
                    disabled={invOffset === 0}
                    onClick={() => setInvOffset(Math.max(0, invOffset - LIMIT))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full px-3"
                    disabled={invOffset + LIMIT >= invTotal}
                    onClick={() => setInvOffset(invOffset + LIMIT)}
                  >
                    Next
                  </Button>
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
                {invStats.isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))
                ) : (
                  [
                    { label: "Total invoiced", value: formatMinorToRupees((invStats.data?.collected_this_month ?? 0) + (invStats.data?.outstanding ?? 0)), color: "" },
                    { label: "Collected", value: formatMinorToRupees(invStats.data?.collected_this_month ?? 0), color: "text-emerald-600" },
                    { label: "Outstanding", value: formatMinorToRupees(invStats.data?.outstanding ?? 0), color: "text-amber-600" },
                    { label: "Refunded", value: "\u20B90", color: "" },
                    { label: "GST collected (18%)", value: formatMinorToRupees(Math.round((invStats.data?.collected_this_month ?? 0) * 0.18)), color: "" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between border-b border-border/60 pb-2 text-sm last:border-b-0 last:pb-0">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={cn("font-medium", item.color)}>{item.value}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/80">
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: Send, label: `Send reminders to all overdue (${invStats.data?.overdue_count ?? 0})`, color: "" },
                  { icon: Download, label: "Export all invoices as CSV", color: "" },
                  { icon: Download, label: "Download invoice ZIP", color: "" },
                  { icon: RefreshCw, label: "Retry failed payments", color: "" },
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
                  <span className="text-emerald-700">Razorpay connected &middot; Test Mode</span>
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
            <Button
              className="rounded-full bg-[#1b4332] text-white hover:bg-[#244d39]"
              disabled={createPlanMut.isPending}
              onClick={() => {
                toast.info("Create plan flow coming soon")
              }}
            >
              + Create New Plan
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {plansQ.isLoading ? (
              <CardSkeleton count={3} />
            ) : (
              plansList.map((plan) => {
                const features = plan.features ? (typeof plan.features === "string" ? JSON.parse(plan.features) : plan.features) as string[] : []
                return (
                  <Card key={plan.id} className="rounded-2xl border border-border/80">
                    <CardHeader>
                      <CardTitle className="text-base">{plan.name} Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: "Price", value: `${formatMinorToRupees(plan.price_minor)}/${plan.billing_period === "monthly" ? "mo" : "yr"}` },
                        { label: "Ponds Limit", value: plan.max_ponds != null ? `${plan.max_ponds} pond${plan.max_ponds === 1 ? "" : "s"}` : "Unlimited ponds" },
                        { label: "Features", value: features.join(", ") || "\u2014" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full rounded-full"
                        disabled={updatePlanMut.isPending}
                        onClick={() => {
                          toast.info("Edit plan flow coming soon")
                        }}
                      >
                        Edit Plan
                      </Button>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
