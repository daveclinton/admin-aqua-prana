"use client"

import { useMemo, useState } from "react"
import {
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type VisibilityState,
  type ColumnDef,
} from "@tanstack/react-table"
import {
  BarChart3,
  Bell,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquare,
  Search,
  Send,
  Smartphone,
  Users,
  Zap,
} from "lucide-react"
import { parseAsStringLiteral, useQueryState, useQueryStates } from "nuqs"
import { toast } from "sonner"
import { DataTable } from "@/components/table/data-table"
import { DataTableToolbar } from "@/components/table/data-table-toolbar"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useDataTable } from "@/hooks/table/use-data-table"
import type { DataTableState } from "@/lib/table/table-types"
import {
  createTableSearchParams,
  parseSortingState,
} from "@/lib/table/table-search-params"
import { getSortingValue, resolveUpdater } from "@/lib/table/table-utils"
import {
  useCommStats,
  useBroadcastHistory,
  useSmsCampaigns,
  useSuppressionList,
  useSendBroadcast,
  useCreateSmsCampaign,
  useRemoveSuppression,
} from "@/features/communication/hooks/use-communication"
import { useOverviewStats } from "@/features/analytics/hooks/use-analytics"
import type {
  BroadcastDTO,
  SmsCampaignDTO,
  SuppressionDTO,
} from "@/features/communication/types"

/* ------------------------------------------------------------------ */
/*  Local row types for tables                                         */
/* ------------------------------------------------------------------ */

type BroadcastRow = {
  id: string
  title: string
  subtitle: string
  channel: "Push" | "SMS" | "Email" | "Push + SMS"
  audience: string
  sent: number
  delivered: number
  opened: number
  openRate: string
  optOuts: number
  sentAt: string
  by: string
}

type SmsCampaignRow = {
  id: string
  campaign: string
  audience: string
  scheduledFor: string
  status: "Draft" | "Scheduled" | "Sent"
  recipients: number
  engagement: string
}

type SuppressionRow = {
  id: string
  farmer: string
  channel: "Push" | "SMS" | "Email"
  date: string
  reason: string
  action: string
}

type AnalyticsAudienceRow = {
  id: string
  audience: string
  rate: number
  tone: "green" | "amber" | "blue" | "red"
}

type SendWindowRow = {
  id: string
  label: string
  value: string
  subtitle: string
}

type MessageTypePerformanceRow = {
  id: string
  type: string
  sends: number
  pushOpen: string
  emailOpen: string
  optOuts: number
  tone: "red" | "blue" | "amber" | "green"
}

/* ------------------------------------------------------------------ */
/*  Static analytics data (no backend endpoint yet)                    */
/* ------------------------------------------------------------------ */

const audiencePerformance: AnalyticsAudienceRow[] = [
  { id: "a1", audience: "Pro Plan Farmers", rate: 84.2, tone: "green" },
  { id: "a2", audience: "Enterprise Farmers", rate: 91, tone: "green" },
  { id: "a3", audience: "Free Tier Farmers", rate: 61.3, tone: "amber" },
  { id: "a4", audience: "New Farmers (<30 days)", rate: 76.8, tone: "blue" },
  { id: "a5", audience: "Inactive (>7 days)", rate: 41.2, tone: "red" },
]

const sendWindows: SendWindowRow[] = [
  { id: "w1", label: "Weekday", value: "9AM", subtitle: "84% open" },
  { id: "w2", label: "Weekday", value: "6PM", subtitle: "81% open" },
  { id: "w3", label: "Weekend", value: "10AM", subtitle: "72% open" },
  { id: "w4", label: "Best Day", value: "Tue", subtitle: "89% open" },
]

const messageTypePerformance: MessageTypePerformanceRow[] = [
  { id: "mt1", type: "Safety Alerts", sends: 18, pushOpen: "91%", emailOpen: "88%", optOuts: 0, tone: "red" },
  { id: "mt2", type: "Product Updates", sends: 4, pushOpen: "84%", emailOpen: "78%", optOuts: 0, tone: "blue" },
  { id: "mt3", type: "Billing Reminders", sends: 12, pushOpen: "74%", emailOpen: "71%", optOuts: 2, tone: "blue" },
  { id: "mt4", type: "Promotions", sends: 6, pushOpen: "62%", emailOpen: "58%", optOuts: 3, tone: "amber" },
]

/* ------------------------------------------------------------------ */
/*  Search-param presets                                               */
/* ------------------------------------------------------------------ */

const tabOptions = ["push", "sms", "analytics", "sent-log"] as const
type CommunicationTab = typeof tabOptions[number]

const smsSearchParams = createTableSearchParams({
  defaultPageSize: 5,
  defaultSort: "scheduledFor.desc",
  urlKeys: { globalFilter: "smsQ", pageIndex: "smsPage", pageSize: "smsSize", sort: "smsSort" },
})

const sentLogSearchParams = createTableSearchParams({
  defaultPageSize: 5,
  defaultSort: "sentAt.desc",
  urlKeys: { globalFilter: "logQ", pageIndex: "logPage", pageSize: "logSize", sort: "logSort" },
})

const suppressionSearchParams = createTableSearchParams({
  defaultPageSize: 5,
  defaultSort: "date.desc",
  urlKeys: { globalFilter: "supQ", pageIndex: "supPage", pageSize: "supSize", sort: "supSort" },
})

/* ------------------------------------------------------------------ */
/*  Helpers: map DTOs -> table rows                                     */
/* ------------------------------------------------------------------ */

function mapBroadcastToRow(b: BroadcastDTO): BroadcastRow {
  const openRate = b.recipient_count > 0 ? Math.round((b.read_count / b.recipient_count) * 100) : 0
  return {
    id: b.batch_id,
    title: b.title,
    subtitle: b.body.length > 60 ? `${b.body.slice(0, 60)}...` : b.body,
    channel: "Push",
    audience: b.category || "All Users",
    sent: b.recipient_count,
    delivered: b.recipient_count,
    opened: b.read_count,
    openRate: `${openRate}%`,
    optOuts: 0,
    sentAt: new Date(b.sent_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    by: "Admin",
  }
}

function mapSmsCampaignToRow(c: SmsCampaignDTO): SmsCampaignRow {
  const deliveryRate = c.recipients > 0 && c.delivered > 0 ? `${Math.round((c.delivered / c.recipients) * 100)}%` : "—"
  const statusMap: Record<string, SmsCampaignRow["status"]> = { draft: "Draft", scheduled: "Scheduled", sent: "Sent" }
  return {
    id: c.id,
    campaign: c.title,
    audience: c.audience || "All Farmers",
    scheduledFor: c.scheduled_for
      ? new Date(c.scheduled_for).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : c.status === "draft" ? "Draft" : "—",
    status: statusMap[c.status.toLowerCase()] ?? "Draft",
    recipients: c.recipients,
    engagement: deliveryRate,
  }
}

function mapSuppressionToRow(s: SuppressionDTO): SuppressionRow {
  const channelMap: Record<string, SuppressionRow["channel"]> = { push: "Push", sms: "SMS", email: "Email" }
  return {
    id: s.id,
    farmer: s.farmer_name ?? s.farmer_email,
    channel: channelMap[s.channel.toLowerCase()] ?? "Push",
    date: new Date(s.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    reason: s.reason,
    action: "Re-subscribe",
  }
}

/* ------------------------------------------------------------------ */
/*  Skeleton helpers                                                   */
/* ------------------------------------------------------------------ */

function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </>
  )
}

function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function CommunicationClient() {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(tabOptions).withDefault("push")
  )

  /* ---- form state: push ---- */
  const [pushTitle, setPushTitle] = useState("")
  const [pushBody, setPushBody] = useState("")
  const [selectedAudience, setSelectedAudience] = useState("All Users")
  const [pushCategory, setPushCategory] = useState("")
  const [pushSeverity, setPushSeverity] = useState("")

  /* ---- form state: sms ---- */
  const [smsCampaignName, setSmsCampaignName] = useState("")
  const [smsMessage, setSmsMessage] = useState("")
  const [selectedSmsAudience, setSelectedSmsAudience] = useState("All Farmers")
  const [smsScheduledFor, setSmsScheduledFor] = useState("")

  /* ---- search state: sent log ---- */
  const [sentLogSearch, setSentLogSearch] = useState("")

  /* ---- static option lists ---- */
  const audienceOptions = ["All Users", "Free Tier", "Pro Plan", "Enterprise", "Mumbai", "Chennai", "Kolkata", "Has Critical Alerts"]
  const smsAudienceOptions = ["All Farmers", "Shrimp Farmers", "Pro Plan", "Overdue Billing", "Critical Alerts", "New this month"]
  const pushCategoryOptions = ["alerts", "tasks", "system"]
  const pushSeverityOptions = ["info", "warning", "critical"]

  /* ---- API hooks ---- */
  const stats = useCommStats()
  const overviewStats = useOverviewStats()
  const broadcastHistory = useBroadcastHistory({ search: sentLogSearch || undefined, limit: 20 })
  const smsCampaignsQuery = useSmsCampaigns({ limit: 20 })
  const suppressions = useSuppressionList({ channel: "push" })

  const sendBroadcast = useSendBroadcast()
  const createSmsCampaign = useCreateSmsCampaign()
  const removeSuppression = useRemoveSuppression()

  /* ---- derived data ---- */
  const broadcastRows: BroadcastRow[] = useMemo(
    () => (broadcastHistory.data?.broadcasts ?? []).map(mapBroadcastToRow),
    [broadcastHistory.data],
  )

  const smsCampaignRows: SmsCampaignRow[] = useMemo(
    () => (smsCampaignsQuery.data?.campaigns ?? []).map(mapSmsCampaignToRow),
    [smsCampaignsQuery.data],
  )

  const suppressionRows: SuppressionRow[] = useMemo(
    () => (suppressions.data?.suppressions ?? []).map(mapSuppressionToRow),
    [suppressions.data],
  )

  const recentPushSends = broadcastRows.slice(0, 3)

  /* ---- estimated reach from overview stats ---- */
  const estimatedReach = overviewStats.data?.total_farmers ?? "—"

  /* ---- avg recipients from broadcast history ---- */
  const avgRecipients = useMemo(() => {
    const broadcasts = broadcastHistory.data?.broadcasts ?? []
    if (broadcasts.length === 0) return "—"
    const total = broadcasts.reduce((sum, b) => sum + b.recipient_count, 0)
    return String(Math.round(total / broadcasts.length))
  }, [broadcastHistory.data])

  /* ---- channel performance from stats ---- */
  const channelPerformancePush = useMemo(() => {
    if (!stats.data) return "—"
    return `${stats.data.sent_this_month} sent · ${stats.data.avg_open_rate.toFixed(0)}% open rate`
  }, [stats.data])

  const totalDelivered = stats.data ? String(stats.data.total_recipients_this_month) : "—"
  const totalFailed = "—"

  /* ---- handlers ---- */
  function handleSendNotification() {
    sendBroadcast.mutate(
      {
        title: pushTitle,
        body: pushBody,
        category: pushCategory || undefined,
        severity: pushSeverity || undefined,
        target_role: selectedAudience !== "All Users" ? selectedAudience : undefined,
      },
      {
        onSuccess: (data) => {
          toast.success(`Notification sent to ${data.recipients} recipients`)
          setPushTitle("")
          setPushBody("")
          setPushCategory("")
          setPushSeverity("")
        },
        onError: (err) => {
          toast.error(err.message || "Failed to send notification")
        },
      },
    )
  }

  function handlePushSaveDraft() {
    toast.info("Draft saved")
  }

  function handlePushSchedule() {
    toast.info("Scheduling coming soon")
  }

  function handleSmsSendNow() {
    createSmsCampaign.mutate(
      {
        title: smsCampaignName,
        body: smsMessage,
        audience: selectedSmsAudience,
      },
      {
        onSuccess: () => {
          toast.success("SMS campaign sent immediately")
          setSmsCampaignName("")
          setSmsMessage("")
          setSmsScheduledFor("")
        },
        onError: (err) => {
          toast.error(err.message || "Failed to send SMS campaign")
        },
      },
    )
  }

  function handleSmsSchedule() {
    if (!smsScheduledFor) {
      toast.info("Please select a date and time to schedule")
      return
    }
    createSmsCampaign.mutate(
      {
        title: smsCampaignName,
        body: smsMessage,
        audience: selectedSmsAudience,
        scheduled_for: smsScheduledFor,
      },
      {
        onSuccess: () => {
          toast.success("SMS campaign scheduled")
          setSmsCampaignName("")
          setSmsMessage("")
          setSmsScheduledFor("")
        },
        onError: (err) => {
          toast.error(err.message || "Failed to schedule SMS campaign")
        },
      },
    )
  }

  function handleSmsSaveDraft() {
    createSmsCampaign.mutate(
      {
        title: smsCampaignName,
        body: smsMessage,
        audience: selectedSmsAudience,
      },
      {
        onSuccess: () => {
          toast.success("SMS campaign saved as draft")
          setSmsCampaignName("")
          setSmsMessage("")
          setSmsScheduledFor("")
        },
        onError: (err) => {
          toast.error(err.message || "Failed to save draft")
        },
      },
    )
  }

  function handleSmsSendTest() {
    toast.info("Test SMS sending coming soon")
  }

  /* ---- stat values ---- */
  const avgOpenRate = stats.data ? `${stats.data.avg_open_rate.toFixed(1)}%` : "—"
  const sentThisMonth = stats.data ? String(stats.data.sent_this_month) : "—"
  const totalSuppressions = stats.data ? String(stats.data.total_suppressions) : "—"
  const pushSuppressions = stats.data ? String(stats.data.push_suppressions) : "—"
  const smsDrafts = stats.data ? String(stats.data.sms_drafts) : "—"
  const smsCampaignCount = stats.data ? String(stats.data.sms_sent + stats.data.sms_scheduled) : "—"
  const smsScheduledCount = stats.data ? String(stats.data.sms_scheduled) : "—"

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Communication</h2>
          <p className="text-sm text-muted-foreground">
            Draft, schedule, and review outreach across push, SMS, analytics, and sent broadcasts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="rounded-full px-3 py-1.5">ADMIN</Badge>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(value) => void setTab(value as CommunicationTab)}>
        <TabsList variant="line" className="border-b pb-1">
          <TabsTrigger value="push" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Push Notifications
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-1.5">
            <Smartphone className="h-3.5 w-3.5" /> SMS Campaigns
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Engagement Analytics
          </TabsTrigger>
          <TabsTrigger value="sent-log" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Sent Log
          </TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/*  PUSH TAB                                                        */}
        {/* ================================================================ */}
        <TabsContent value="push" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.isLoading ? (
              <KpiSkeleton count={4} />
            ) : (
              <>
                <KpiCard title="Avg Open Rate" value={avgOpenRate} subtitle="↑ +3% vs last month" icon={Bell} variant="green" />
                <KpiCard title="Sent This Month" value={sentThisMonth} subtitle="Push broadcasts only" icon={Send} variant="default" />
                <KpiCard title="Opt-Outs" value={pushSuppressions} subtitle="Needs audience review" icon={MessageSquare} variant="amber" />
                <KpiCard title="Drafts Pending" value={smsDrafts} subtitle="Ready for approval" icon={Zap} variant="teal" />
              </>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Compose Push Notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Title</label>
                  <Input
                    value={pushTitle}
                    onChange={(event) => setPushTitle(event.target.value)}
                    placeholder="e.g. White spot alert — North region"
                    maxLength={100}
                  />
                  <p className="text-right text-xs text-muted-foreground">{pushTitle.length}/100</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Body</label>
                  <Textarea
                    value={pushBody}
                    onChange={(event) => setPushBody(event.target.value)}
                    placeholder="Message body — 160 character limit recommended for push..."
                    className="min-h-28"
                    maxLength={160}
                  />
                  <p className="text-right text-xs text-muted-foreground">{pushBody.length} / 160 chars</p>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Target Audience</label>
                  <div className="flex flex-wrap gap-2">
                    {audienceOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedAudience(option)}
                        className={
                          option === selectedAudience
                            ? "rounded-full bg-[#1b4332] px-3 py-1.5 text-xs font-medium text-white"
                            : "rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Estimated reach: <span className="font-semibold text-foreground">{estimatedReach} users</span></p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</label>
                    <select
                      value={pushCategory}
                      onChange={(event) => setPushCategory(event.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Select category...</option>
                      {pushCategoryOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Severity</label>
                    <select
                      value={pushSeverity}
                      onChange={(event) => setPushSeverity(event.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Select severity...</option>
                      {pushSeverityOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button variant="outline" onClick={handlePushSaveDraft} disabled={!pushTitle || !pushBody}>
                    Save Draft
                  </Button>
                  <Button variant="outline" onClick={handlePushSchedule} disabled={!pushTitle || !pushBody}>
                    Schedule
                  </Button>
                  <Button onClick={handleSendNotification} disabled={sendBroadcast.isPending || !pushTitle || !pushBody}>
                    {sendBroadcast.isPending ? "Sending..." : "Send Now"}
                    <Send className="ml-2 size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex min-h-48 items-center justify-center">
                  <div className="w-full max-w-sm rounded-3xl bg-[#1c1a2e] p-4 text-white shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-[#1f5b3d] text-xs font-bold">
                          AP
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Aquaprana</p>
                        </div>
                      </div>
                      <span className="text-xs text-white/50">now</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold">{pushTitle || "Notification title"}</p>
                      <p className="text-sm text-white/70">{pushBody || "Notification preview body"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Recent Sends</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {broadcastHistory.isLoading ? (
                    <TableSkeleton rows={3} />
                  ) : recentPushSends.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent sends yet.</p>
                  ) : (
                    recentPushSends.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 rounded-xl border px-3 py-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <Send className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.sentAt} · {item.sent} users · <span className="font-medium text-emerald-600">{item.openRate} opened</span>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Push Queue Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border px-3 py-3">
                    <div>
                      <p className="text-sm font-medium">Scheduled</p>
                      <p className="text-xs text-muted-foreground">{smsScheduledCount} broadcasts waiting for their send window</p>
                    </div>
                    <Badge variant="secondary">{smsScheduledCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border px-3 py-3">
                    <div>
                      <p className="text-sm font-medium">Drafts</p>
                      <p className="text-xs text-muted-foreground">{smsDrafts} messages need review before publishing</p>
                    </div>
                    <Badge variant="outline">{smsDrafts}</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border px-3 py-3">
                    <div>
                      <p className="text-sm font-medium">Best send window</p>
                      <p className="text-xs text-muted-foreground">09:00 - 11:00 is currently your strongest push slot</p>
                    </div>
                    <Clock3 className="size-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Suppression List</CardTitle>
            </CardHeader>
            <CardContent>
              {suppressions.isLoading ? (
                <TableSkeleton rows={3} />
              ) : (
                <SuppressionTable
                  data={suppressionRows}
                  onRemove={(id) => {
                    removeSuppression.mutate(id, {
                      onSuccess: () => toast.success("Suppression removed"),
                      onError: (err) => toast.error(err.message || "Failed to remove suppression"),
                    })
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/*  SMS TAB                                                         */}
        {/* ================================================================ */}
        <TabsContent value="sms" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            {stats.isLoading ? (
              <KpiSkeleton count={3} />
            ) : (
              <>
                <KpiCard title="SMS Campaigns" value={smsCampaignCount} subtitle={`${smsScheduledCount} queued right now`} icon={Smartphone} variant="green" />
                <KpiCard title="Delivery Rate" value="94%" subtitle="Across recent sends" icon={CheckCircle2} variant="teal" />
                <KpiCard title="Opt-Out Pressure" value="Low" subtitle={`${stats.data?.sms_suppressions ?? 0} flagged audiences`} icon={MessageSquare} variant="amber" />
              </>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Compose SMS Campaign</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Campaign Name</label>
                  <Input
                    value={smsCampaignName}
                    onChange={(event) => setSmsCampaignName(event.target.value)}
                    placeholder="e.g. February Feed Promo"
                    maxLength={100}
                  />
                  <p className="text-right text-xs text-muted-foreground">{smsCampaignName.length}/100</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</label>
                  <Textarea
                    value={smsMessage}
                    onChange={(event) => setSmsMessage(event.target.value)}
                    placeholder="SMS text — max 160 characters. Variables: {name}, {pond_count}, {pondscore}"
                    className="min-h-28"
                    maxLength={160}
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {smsMessage.length} / 160 chars · Est. ₹0
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Target Audience</label>
                  <div className="flex flex-wrap gap-2">
                    {smsAudienceOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedSmsAudience(option)}
                        className={
                          option === selectedSmsAudience
                            ? "rounded-full bg-[#1b4332] px-3 py-1.5 text-xs font-medium text-white"
                            : "rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Estimated reach: <span className="font-semibold text-foreground">{estimatedReach} users</span> · Est. cost: <span className="font-semibold text-foreground">—</span>
                  </p>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <span className="font-medium">SMS Billing:</span> ₹0.50/message · Balance: <span className="font-semibold">₹8,400</span> · Credit top-up available in Settings.
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Delivery</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="datetime-local"
                      className="h-9 w-[210px]"
                      value={smsScheduledFor}
                      onChange={(e) => setSmsScheduledFor(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleSmsSaveDraft} disabled={createSmsCampaign.isPending || !smsCampaignName || !smsMessage}>
                      Save Draft
                    </Button>
                    <Button variant="outline" onClick={handleSmsSendTest}>
                      Send Test SMS
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleSmsSchedule} disabled={createSmsCampaign.isPending || !smsCampaignName || !smsMessage}>
                      Schedule
                    </Button>
                    <Button onClick={handleSmsSendNow} disabled={createSmsCampaign.isPending || !smsCampaignName || !smsMessage}>
                      {createSmsCampaign.isPending ? "Creating..." : "Send Now"}
                      <Send className="ml-2 size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>SMS Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex min-h-56 items-center justify-center">
                  <div className="w-full max-w-sm rounded-3xl bg-[#eef6f1] p-4 text-[#1b2e25]">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#7a9a8b]">Aquaprana · SMS</p>
                    <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-sm leading-6">{smsMessage || "SMS preview body"}</p>
                    </div>
                    <p className="mt-3 text-right text-xs text-[#7a9a8b]">
                      {smsMessage.length} chars · 1 SMS unit
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Opt-Out Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <p className="text-sm text-muted-foreground">Total opt-outs</p>
                    <p className="text-2xl font-semibold">{stats.data?.sms_suppressions ?? "—"}</p>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3">
                    <p className="text-sm text-muted-foreground">Opt-out rate</p>
                    <p className="text-lg font-semibold text-emerald-600">—</p>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3">
                    <p className="text-sm text-muted-foreground">Re-subscribed</p>
                    <p className="text-lg font-semibold">—</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>SMS Broadcast Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {smsCampaignsQuery.isLoading ? (
                <TableSkeleton rows={3} />
              ) : (
                <LocalTable
                  data={smsCampaignRows}
                  columns={smsCampaignColumns}
                  searchParams={smsSearchParams}
                  fallbackSortColumn="scheduledFor"
                  searchPlaceholder="Search SMS campaigns"
                  emptyTitle="No SMS campaigns"
                  emptyDescription="Create an SMS broadcast to see it here."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/*  ANALYTICS TAB                                                   */}
        {/* ================================================================ */}
        <TabsContent value="analytics" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stats.isLoading ? (
              <KpiSkeleton count={5} />
            ) : (
              <>
                <KpiCard title="Push Open Rate" value={avgOpenRate} subtitle="↑ +3% vs last mo" icon={Bell} variant="green" />
                <KpiCard title="Email Open Rate" value="72%" subtitle="Steady across campaigns" icon={Mail} variant="teal" />
                <KpiCard title="SMS Delivery" value="99.1%" subtitle="Strong system-wide delivery" icon={Smartphone} variant="amber" />
                <KpiCard title="Opt-Out Rate" value="0.6%" subtitle="Well within healthy range" icon={MessageSquare} variant="default" />
                <KpiCard title="Messages Sent / Mo" value={sentThisMonth} subtitle="All campaign channels" icon={Send} variant="green" />
              </>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Open Rate Trend — All Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-end gap-2">
                  <button className="rounded-full bg-[#224d3a] px-4 py-1.5 text-xs font-medium text-white">30D</button>
                  <button className="rounded-full border px-4 py-1.5 text-xs font-medium text-muted-foreground">90D</button>
                  <button className="rounded-full border px-4 py-1.5 text-xs font-medium text-muted-foreground">12M</button>
                </div>
                <div className="rounded-2xl bg-[#f3f8f4] p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-end gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-600" /> Push {avgOpenRate}</span>
                    <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-teal-500" /> Email 72%</span>
                    <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" /> SMS 99%</span>
                  </div>
                  <div className="relative h-44 overflow-hidden rounded-xl bg-[linear-gradient(to_right,transparent_0%,transparent_24.5%,rgba(23,57,42,0.06)_25%,transparent_25.5%,transparent_49.5%,rgba(23,57,42,0.06)_50%,transparent_50.5%,transparent_74.5%,rgba(23,57,42,0.06)_75%,transparent_75.5%),linear-gradient(to_bottom,rgba(23,57,42,0.04)_1px,transparent_1px)] bg-[length:100%_100%,100%_36px]">
                    <div className="absolute left-[26%] right-[10%] top-4 border-t-2 border-dashed border-amber-400" />
                    <div className="absolute inset-x-[26%] bottom-8 top-10">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                        <polyline
                          fill="none"
                          stroke="#2f855a"
                          strokeWidth="2.2"
                          points="0,72 18,64 42,49 66,33 100,24"
                        />
                        <polyline
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="1.8"
                          strokeDasharray="4 2"
                          points="0,77 18,69 42,56 66,42 100,34"
                        />
                        <circle cx="100" cy="24" r="2.7" fill="#2f855a" />
                      </svg>
                    </div>
                    <div className="absolute bottom-1 left-[26%] right-[10%] flex justify-between text-[10px] text-muted-foreground">
                      <span>Jan 22</span>
                      <span>Jan 29</span>
                      <span>Feb 5</span>
                      <span>Feb 12</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Message Type Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-2xl border">
                  <div className="grid grid-cols-[1.2fr_0.6fr_0.7fr_0.7fr_0.7fr] gap-3 bg-muted/40 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Type</span>
                    <span>Sends</span>
                    <span>Push Open</span>
                    <span>Email Open</span>
                    <span>Opt-Outs</span>
                  </div>
                  <div className="divide-y">
                    {messageTypePerformance.map((item) => (
                      <div key={item.id} className="grid grid-cols-[1.2fr_0.6fr_0.7fr_0.7fr_0.7fr] gap-3 px-4 py-4 text-sm">
                        <div>
                          <AnalyticsToneBadge tone={item.tone}>{item.type}</AnalyticsToneBadge>
                        </div>
                        <span>{item.sends}</span>
                        <span className={item.pushOpen === "91%" || item.pushOpen === "84%" ? "font-medium text-emerald-600" : item.pushOpen === "62%" ? "font-medium text-amber-600" : "font-medium text-blue-600"}>{item.pushOpen}</span>
                        <span>{item.emailOpen}</span>
                        <span>{item.optOuts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Audience Engagement Segments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {audiencePerformance.map((segment) => (
                  <div key={segment.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-medium">{segment.audience}</p>
                      <p className={analyticsToneText(segment.tone)}>{segment.rate.toFixed(1)}%</p>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={analyticsToneBar(segment.tone)}
                        style={{ width: `${segment.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Send Time Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl bg-[#f3f8f4] p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Best times to send (by open rate)
                  </p>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {sendWindows.map((item) => (
                      <div key={item.id} className="rounded-xl border bg-white px-4 py-3 text-center shadow-xs shadow-black/5">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className={item.value === "10AM" ? "mt-1 text-2xl font-semibold text-amber-600" : item.value === "Tue" ? "mt-1 text-2xl font-semibold text-blue-600" : "mt-1 text-2xl font-semibold text-emerald-600"}>{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-0">
                  <AnalyticsSummaryRow label="Opt-out rate (30d)" value="0.6%" valueClassName="text-emerald-600" />
                  <AnalyticsSummaryRow label="Avg messages / user / mo" value="3.2" />
                  <AnalyticsSummaryRow label="Highest performing message" value="Safety Alerts (91%)" valueClassName="text-emerald-600" />
                </div>

                <Button variant="outline" onClick={() => toast.info("Export coming soon")}>Download Analytics Report</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/*  SENT LOG TAB                                                    */}
        {/* ================================================================ */}
        <TabsContent value="sent-log" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.isLoading ? (
              <KpiSkeleton count={4} />
            ) : (
              <>
                <KpiCard title="Messages Sent" value={sentThisMonth} subtitle="This month" icon={Mail} variant="green" />
                <KpiCard title="Avg Open Rate" value={avgOpenRate} subtitle="Across all sends" icon={CheckCircle2} variant="teal" />
                <KpiCard title="Opt-Outs" value={totalSuppressions} subtitle="This month" icon={MessageSquare} variant="amber" />
                <KpiCard title="Avg Recipients" value={avgRecipients} subtitle="Per broadcast" icon={Users} variant="default" />
              </>
            )}
          </div>

          <Card className="rounded-2xl">
            <CardHeader className="flex-row items-center justify-between gap-3">
              <CardTitle>Broadcast History</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full min-w-[220px] md:w-[260px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-9 pl-9"
                    placeholder="Search by title or recipient..."
                    value={sentLogSearch}
                    onChange={(e) => setSentLogSearch(e.target.value)}
                  />
                </div>
                <SimpleFilterChip label="All Channels" />
                <SimpleFilterChip label="All Audiences" />
                <SimpleFilterChip label="All Time" />
              </div>
            </CardHeader>
            <CardContent>
              {broadcastHistory.isLoading ? (
                <TableSkeleton rows={5} />
              ) : (
                <LocalTable
                  data={broadcastRows}
                  columns={broadcastColumns}
                  searchParams={sentLogSearchParams}
                  fallbackSortColumn="sentAt"
                  searchPlaceholder="Search by title or recipient"
                  emptyTitle="No broadcasts found"
                  emptyDescription="Sent broadcasts will appear here."
                  showToolbar={false}
                  footerNote={`Showing ${broadcastRows.length} of ${broadcastHistory.data?.total ?? 0} broadcasts`}
                />
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Channel Performance</CardTitle>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ChannelMetric label="Push Notifications" summary={channelPerformancePush} />
                <ChannelMetric label="SMS" summary="—" />
                <ChannelMetric label="Email" summary="—" />
                <div className="grid grid-cols-3 gap-3 border-t pt-4 text-sm">
                  <SummaryMetric label="Total delivered" value={totalDelivered} className="text-emerald-600" />
                  <SummaryMetric label="Failed" value={totalFailed} className="text-red-600" />
                  <SummaryMetric label="Opt-outs" value={totalSuppressions} className="text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Opt-Out & Suppression List</CardTitle>
                <Button variant="outline" size="sm" onClick={() => toast.info("Export coming soon")}>Export List</Button>
              </CardHeader>
              <CardContent>
                {suppressions.isLoading ? (
                  <TableSkeleton rows={3} />
                ) : (
                  <LocalTable
                    data={suppressionRows}
                    columns={suppressionColumns}
                    searchParams={suppressionSearchParams}
                    fallbackSortColumn="date"
                    searchPlaceholder="Search suppressions"
                    emptyTitle="No suppressions"
                    emptyDescription="Suppressed recipients will appear here."
                    showToolbar={false}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ================================================================== */
/*  Suppression table with remove action                              */
/* ================================================================== */

function SuppressionTable({
  data,
  onRemove,
}: {
  data: SuppressionRow[]
  onRemove: (id: string) => void
}) {
  const columns: ColumnDef<SuppressionRow, unknown>[] = useMemo(
    () => [
      { accessorKey: "farmer", header: "Farmer", enableHiding: false },
      {
        accessorKey: "channel",
        header: "Channel",
        cell: ({ row }) => <ChannelBadge value={row.original.channel} />,
      },
      { accessorKey: "date", header: "Date" },
      { accessorKey: "reason", header: "Reason" },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <Button variant="outline" size="sm" onClick={() => onRemove(row.original.id)}>
            {row.original.action}
          </Button>
        ),
      },
    ],
    [onRemove],
  )

  return (
    <LocalTable
      data={data}
      columns={columns}
      searchParams={suppressionSearchParams}
      fallbackSortColumn="date"
      searchPlaceholder="Search suppressions"
      emptyTitle="No suppressions"
      emptyDescription="Suppressed recipients will appear here."
      showToolbar={false}
    />
  )
}

/* ================================================================== */
/*  LocalTable — reused across multiple sections                      */
/* ================================================================== */

function LocalTable<TData extends { id: string }>({
  data,
  columns,
  searchParams,
  fallbackSortColumn,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  showToolbar = true,
  footerNote,
}: {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  searchParams: ReturnType<typeof createTableSearchParams>
  fallbackSortColumn: string
  searchPlaceholder: string
  emptyTitle: string
  emptyDescription: string
  showToolbar?: boolean
  footerNote?: string
}) {
  const [queryState, setQueryState] = useQueryStates(
    searchParams.parsers,
    { history: "replace", urlKeys: searchParams.urlKeys }
  )
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const pagination: PaginationState = {
    pageIndex: queryState.pageIndex,
    pageSize: queryState.pageSize,
  }

  const sorting = useMemo(
    () => parseSortingState(queryState.sort, fallbackSortColumn),
    [queryState.sort, fallbackSortColumn]
  )

  const tableState: DataTableState = {
    pagination,
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    globalFilter: queryState.globalFilter,
  }

  const table = useDataTable<TData>({
    data,
    columns,
    state: tableState,
    onPaginationChange: (updater) => {
      const next = resolveUpdater(updater, pagination)
      void setQueryState({ pageIndex: next.pageIndex, pageSize: next.pageSize })
    },
    onSortingChange: (updater) => {
      const next = resolveUpdater(updater, sorting)
      void setQueryState({ pageIndex: 0, sort: getSortingValue(next, `${fallbackSortColumn}.desc`) })
    },
    onColumnFiltersChange: (updater) => setColumnFilters((current) => resolveUpdater(updater, current)),
    onColumnVisibilityChange: (updater) => setColumnVisibility((current) => resolveUpdater(updater, current)),
    onRowSelectionChange: (updater) => setRowSelection((current) => resolveUpdater(updater, current)),
    onGlobalFilterChange: (value) => {
      void setQueryState({
        globalFilter: resolveUpdater(value, queryState.globalFilter),
        pageIndex: 0,
      })
    },
  })

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-xs shadow-black/5">
      {showToolbar ? <DataTableToolbar table={table} searchPlaceholder={searchPlaceholder} /> : null}
      <DataTable
        table={table}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
      {footerNote ? (
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          {footerNote}
        </div>
      ) : null}
    </div>
  )
}

/* ================================================================== */
/*  Small helper components                                           */
/* ================================================================== */

function ChannelMetric({ label, summary }: { label: string; summary: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-3">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">{summary}</p>
    </div>
  )
}

function SummaryMetric({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={className}>{value}</p>
    </div>
  )
}

function SimpleFilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
    >
      {label}
    </button>
  )
}

/* ================================================================== */
/*  Column definitions                                                 */
/* ================================================================== */

const smsCampaignColumns: ColumnDef<SmsCampaignRow>[] = [
  {
    accessorKey: "campaign",
    header: "Campaign",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="font-medium">{row.original.campaign}</p>
        <p className="text-xs text-muted-foreground">{row.original.audience}</p>
      </div>
    ),
    enableHiding: false,
  },
  { accessorKey: "scheduledFor", header: "Scheduled" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge value={row.original.status} />,
  },
  { accessorKey: "recipients", header: "Recipients" },
  { accessorKey: "engagement", header: "Engagement" },
]

const broadcastColumns: ColumnDef<BroadcastRow>[] = [
  {
    accessorKey: "title",
    header: "Title / Message",
    cell: ({ row }) => (
      <div className="max-w-[280px] space-y-0.5">
        <p className="truncate font-medium">{row.original.title}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.subtitle}</p>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => <ChannelBadge value={row.original.channel} />,
  },
  { accessorKey: "audience", header: "Audience" },
  { accessorKey: "sent", header: "Sent" },
  { accessorKey: "delivered", header: "Delivered" },
  { accessorKey: "opened", header: "Opened" },
  {
    accessorKey: "openRate",
    header: "Open Rate",
    cell: ({ row }) => <span className="font-medium text-emerald-600">{row.original.openRate}</span>,
  },
  { accessorKey: "optOuts", header: "Opt-Outs" },
  { accessorKey: "sentAt", header: "Sent At" },
  { accessorKey: "by", header: "By" },
]

const suppressionColumns: ColumnDef<SuppressionRow>[] = [
  { accessorKey: "farmer", header: "Farmer", enableHiding: false },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => <ChannelBadge value={row.original.channel} />,
  },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "reason", header: "Reason" },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Button variant="outline" size="sm">{row.original.action}</Button>
    ),
  },
]

/* ================================================================== */
/*  Badge helpers                                                      */
/* ================================================================== */

function ChannelBadge({ value }: { value: BroadcastRow["channel"] | SuppressionRow["channel"] }) {
  if (value === "SMS") return <Badge variant="destructive">{value}</Badge>
  if (value === "Email") return <Badge variant="outline">{value}</Badge>
  if (value === "Push + SMS") return <Badge variant="default">{value}</Badge>
  return <Badge variant="secondary">{value}</Badge>
}

function StatusBadge({ value }: { value: SmsCampaignRow["status"] }) {
  if (value === "Sent") return <Badge variant="default">{value}</Badge>
  if (value === "Scheduled") return <Badge variant="secondary">{value}</Badge>
  return <Badge variant="outline">{value}</Badge>
}

function AnalyticsToneBadge({
  tone,
  children,
}: {
  tone: MessageTypePerformanceRow["tone"]
  children: string
}) {
  const className =
    tone === "red"
      ? "bg-red-50 text-red-600"
      : tone === "blue"
        ? "bg-blue-50 text-blue-600"
        : tone === "amber"
          ? "bg-amber-50 text-amber-600"
          : "bg-emerald-50 text-emerald-600"

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>
}

function AnalyticsSummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between border-b py-3 last:border-b-0 last:pb-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium ${valueClassName ?? ""}`.trim()}>{value}</p>
    </div>
  )
}

function analyticsToneText(tone: AnalyticsAudienceRow["tone"]) {
  if (tone === "green") return "font-medium text-emerald-600"
  if (tone === "amber") return "font-medium text-amber-600"
  if (tone === "blue") return "font-medium text-blue-600"
  return "font-medium text-red-500"
}

function analyticsToneBar(tone: AnalyticsAudienceRow["tone"]) {
  if (tone === "green") return "h-full rounded-full bg-emerald-500"
  if (tone === "amber") return "h-full rounded-full bg-amber-500"
  if (tone === "blue") return "h-full rounded-full bg-blue-600"
  return "h-full rounded-full bg-red-500"
}
