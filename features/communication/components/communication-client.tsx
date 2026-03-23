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
import { DataTable } from "@/components/table/data-table"
import { DataTableToolbar } from "@/components/table/data-table-toolbar"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

type SuppressionRow = {
  id: string
  farmer: string
  channel: "Push" | "SMS" | "Email"
  date: string
  reason: string
  action: string
}

type CampaignRow = {
  id: string
  campaign: string
  audience: string
  scheduledFor: string
  status: "Draft" | "Scheduled" | "Sent"
  recipients: number
  engagement: string
}

type AnalyticsAudienceRow = {
  id: string
  audience: string
  channelMix: string
  reach: number
  openRate: string
  optOuts: number
}

type SendWindowRow = {
  id: string
  window: string
  channel: "Push" | "SMS" | "Email" | "Push + SMS"
  sends: number
  openRate: string
  note: string
}

const broadcastHistory: BroadcastRow[] = [
  {
    id: "b1",
    title: "White spot disease alert — North region",
    subtitle: "Urgent disease advisory for shrimp farmers",
    channel: "Push + SMS",
    audience: "Chennai",
    sent: 38,
    delivered: 37,
    opened: 34,
    openRate: "91%",
    optOuts: 0,
    sentAt: "Feb 18, 09:00",
    by: "Admin",
  },
  {
    id: "b2",
    title: "February feed discount — Pro users",
    subtitle: "15% off premium feed this week",
    channel: "Push",
    audience: "Pro Plan",
    sent: 98,
    delivered: 96,
    opened: 62,
    openRate: "64%",
    optOuts: 2,
    sentAt: "Feb 15, 11:30",
    by: "Admin",
  },
  {
    id: "b3",
    title: "System maintenance — All users",
    subtitle: "Scheduled downtime Tue 2–4 AM IST",
    channel: "Email",
    audience: "All Users",
    sent: 200,
    delivered: 198,
    opened: 144,
    openRate: "72%",
    optOuts: 1,
    sentAt: "Feb 12, 08:00",
    by: "Admin",
  },
  {
    id: "b4",
    title: "New AquaGPT features update",
    subtitle: "Multi-language support + faster responses",
    channel: "Push",
    audience: "All Users",
    sent: 200,
    delivered: 199,
    opened: 168,
    openRate: "84%",
    optOuts: 0,
    sentAt: "Feb 1, 10:00",
    by: "Admin",
  },
  {
    id: "b5",
    title: "Low DO alert — Mumbai region",
    subtitle: "Critical DO below 3 mg/L in 6 ponds",
    channel: "SMS",
    audience: "Mumbai",
    sent: 62,
    delivered: 61,
    opened: 58,
    openRate: "93%",
    optOuts: 0,
    sentAt: "Jan 28, 06:45",
    by: "Auto",
  },
]

const suppressionList: SuppressionRow[] = [
  { id: "s1", farmer: "bce Farmer", channel: "SMS", date: "Feb 15", reason: "Too frequent", action: "Re-subscribe" },
  { id: "s2", farmer: "Sample Farmer 2", channel: "Push", date: "Feb 10", reason: "Not relevant", action: "Re-subscribe" },
  { id: "s3", farmer: "Ravi Pond", channel: "Email", date: "Jan 22", reason: "Unsubscribed", action: "Re-subscribe" },
]

const pushCampaigns: CampaignRow[] = [
  { id: "p1", campaign: "Disease Alert: East Coast", audience: "At-risk ponds", scheduledFor: "Today, 08:30", status: "Sent", recipients: 124, engagement: "88%" },
  { id: "p2", campaign: "Feed Reminder", audience: "Standard plan", scheduledFor: "Tomorrow, 06:00", status: "Scheduled", recipients: 280, engagement: "—" },
  { id: "p3", campaign: "AquaGPT Weekly Tips", audience: "All farmers", scheduledFor: "Draft", status: "Draft", recipients: 0, engagement: "—" },
]

const smsCampaigns: CampaignRow[] = [
  { id: "m1", campaign: "Emergency Oxygen Alert", audience: "North cluster", scheduledFor: "Today, 05:45", status: "Sent", recipients: 64, engagement: "93%" },
  { id: "m2", campaign: "Payment Reminder", audience: "Outstanding invoices", scheduledFor: "Tomorrow, 09:00", status: "Scheduled", recipients: 41, engagement: "—" },
  { id: "m3", campaign: "Harvest Window Update", audience: "Harvest-ready farms", scheduledFor: "Draft", status: "Draft", recipients: 0, engagement: "—" },
]

const audiencePerformance: AnalyticsAudienceRow[] = [
  { id: "a1", audience: "Chennai", channelMix: "Push + SMS", reach: 38, openRate: "91%", optOuts: 0 },
  { id: "a2", audience: "Pro Plan", channelMix: "Push", reach: 98, openRate: "64%", optOuts: 2 },
  { id: "a3", audience: "All Users", channelMix: "Push + Email", reach: 200, openRate: "78%", optOuts: 1 },
  { id: "a4", audience: "Mumbai", channelMix: "SMS", reach: 62, openRate: "93%", optOuts: 0 },
]

const sendWindows: SendWindowRow[] = [
  { id: "w1", window: "06:00 - 08:00", channel: "SMS", sends: 24, openRate: "93%", note: "Strong for urgent pond alerts" },
  { id: "w2", window: "09:00 - 11:00", channel: "Push", sends: 42, openRate: "84%", note: "Best for product and feature updates" },
  { id: "w3", window: "16:00 - 18:00", channel: "Push + SMS", sends: 19, openRate: "88%", note: "Works well for reminder campaigns" },
]

const tabOptions = ["push", "sms", "analytics", "sent-log"] as const
type CommunicationTab = typeof tabOptions[number]

const pushSearchParams = createTableSearchParams({
  defaultPageSize: 5,
  defaultSort: "scheduledFor.desc",
  urlKeys: { globalFilter: "pushQ", pageIndex: "pushPage", pageSize: "pushSize", sort: "pushSort" },
})

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

const audienceSearchParams = createTableSearchParams({
  defaultPageSize: 5,
  defaultSort: "reach.desc",
  urlKeys: { globalFilter: "audQ", pageIndex: "audPage", pageSize: "audSize", sort: "audSort" },
})

const windowsSearchParams = createTableSearchParams({
  defaultPageSize: 5,
  defaultSort: "openRate.desc",
  urlKeys: { globalFilter: "winQ", pageIndex: "winPage", pageSize: "winSize", sort: "winSort" },
})

export function CommunicationClient() {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(tabOptions).withDefault("push")
  )
  const [pushTitle, setPushTitle] = useState("White spot alert — North region")
  const [pushBody, setPushBody] = useState("Check your shrimp ponds for early white spot symptoms. Tap to learn more.")
  const [selectedAudience, setSelectedAudience] = useState("All Users")
  const [smsCampaignName, setSmsCampaignName] = useState("February Feed Promo")
  const [smsMessage, setSmsMessage] = useState("Hi Farmer, your pond DO level needs attention. Log in to Aquaprana for guidance. Reply STOP to opt out.")
  const [selectedSmsAudience, setSelectedSmsAudience] = useState("All Farmers")
  const audienceOptions = ["All Users", "Free Tier", "Pro Plan", "Enterprise", "Mumbai", "Chennai", "Kolkata", "Has Critical Alerts"]
  const smsAudienceOptions = ["All Farmers", "Shrimp Farmers", "Pro Plan", "Overdue Billing", "Critical Alerts", "New this month"]
  const recentPushSends = broadcastHistory.filter((item) => item.channel === "Push" || item.channel === "Push + SMS").slice(0, 3)

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
          <div className="relative w-full min-w-[220px] max-w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search..." />
          </div>
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

        <TabsContent value="push" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Avg Open Rate" value="78.4%" subtitle="↑ +3% vs last month" icon={Bell} variant="green" />
            <KpiCard title="Sent This Month" value="142" subtitle="Push broadcasts only" icon={Send} variant="default" />
            <KpiCard title="Opt-Outs" value="8" subtitle="Needs audience review" icon={MessageSquare} variant="amber" />
            <KpiCard title="Drafts Pending" value="3" subtitle="Ready for approval" icon={Zap} variant="teal" />
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
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Body</label>
                  <Textarea
                    value={pushBody}
                    onChange={(event) => setPushBody(event.target.value)}
                    placeholder="Message body — 160 character limit recommended for push..."
                    className="min-h-28"
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
                  <p className="text-sm text-muted-foreground">Estimated reach: <span className="font-semibold text-foreground">200 users</span></p>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Delivery</label>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Send Now</Button>
                    <Button size="sm" variant="outline">Schedule</Button>
                    <Button size="sm" variant="outline">Save Draft</Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>
                    Send Notification
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
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Recent Sends</CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentPushSends.map((item) => (
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
                  ))}
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
                      <p className="text-xs text-muted-foreground">2 broadcasts waiting for their send window</p>
                    </div>
                    <Badge variant="secondary">2</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border px-3 py-3">
                    <div>
                      <p className="text-sm font-medium">Drafts</p>
                      <p className="text-xs text-muted-foreground">3 messages need review before publishing</p>
                    </div>
                    <Badge variant="outline">3</Badge>
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
              <CardTitle>Push Campaign Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <LocalTable
                data={pushCampaigns}
                columns={campaignColumns}
                searchParams={pushSearchParams}
                fallbackSortColumn="scheduledFor"
                searchPlaceholder="Search push campaigns"
                emptyTitle="No push campaigns"
                emptyDescription="Create or import a push campaign to see it here."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <KpiCard title="SMS Campaigns" value="8" subtitle="2 queued right now" icon={Smartphone} variant="green" />
            <KpiCard title="Delivery Rate" value="94%" subtitle="Across recent sends" icon={CheckCircle2} variant="teal" />
            <KpiCard title="Opt-Out Pressure" value="Low" subtitle="3 flagged audiences" icon={MessageSquare} variant="amber" />
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
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</label>
                  <Textarea
                    value={smsMessage}
                    onChange={(event) => setSmsMessage(event.target.value)}
                    placeholder="SMS text — max 160 characters. Variables: {name}, {pond_count}, {pondscore}"
                    className="min-h-28"
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
                    Estimated reach: <span className="font-semibold text-foreground">200 users</span> · Est. cost: <span className="font-semibold text-foreground">₹100</span>
                  </p>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <span className="font-medium">SMS Billing:</span> ₹0.50/message · Balance: <span className="font-semibold">₹8,400</span> · Credit top-up available in Settings.
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Delivery</label>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Send Now</Button>
                    <Button size="sm" variant="outline">Schedule</Button>
                    <Input className="h-9 w-[210px]" placeholder="dd/mm/yyyy, --:--" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">Save Draft</Button>
                    <Button variant="outline">Send Test SMS</Button>
                  </div>
                  <Button>
                    Launch Campaign
                    <Send className="ml-2 size-4" />
                  </Button>
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
                    <p className="text-2xl font-semibold">14</p>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3">
                    <p className="text-sm text-muted-foreground">Opt-out rate</p>
                    <p className="text-lg font-semibold text-emerald-600">0.7%</p>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3">
                    <p className="text-sm text-muted-foreground">Re-subscribed</p>
                    <p className="text-lg font-semibold">3</p>
                  </div>
                  <Button variant="outline">View Opt-Out List</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>SMS Broadcast Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <LocalTable
                data={smsCampaigns}
                columns={campaignColumns}
                searchParams={smsSearchParams}
                fallbackSortColumn="scheduledFor"
                searchPlaceholder="Search SMS campaigns"
                emptyTitle="No SMS campaigns"
                emptyDescription="Create an SMS broadcast to see it here."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Best Channel" value="SMS" subtitle="91% average open rate" icon={BarChart3} variant="green" />
            <KpiCard title="Top Audience" value="Mumbai" subtitle="Highest engagement this month" icon={Users} variant="teal" />
            <KpiCard title="Best Time Slot" value="09:00" subtitle="Push campaigns perform strongest" icon={Clock3} variant="amber" />
            <KpiCard title="Low-Performing Segment" value="Free Tier" subtitle="Needs message refresh" icon={MessageSquare} variant="default" />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Audience Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <LocalTable
                  data={audiencePerformance}
                  columns={audiencePerformanceColumns}
                  searchParams={audienceSearchParams}
                  fallbackSortColumn="reach"
                  searchPlaceholder="Search audiences"
                  emptyTitle="No audience analytics"
                  emptyDescription="Audience engagement data will appear here."
                />
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Best Send Windows</CardTitle>
              </CardHeader>
              <CardContent>
                <LocalTable
                  data={sendWindows}
                  columns={sendWindowColumns}
                  searchParams={windowsSearchParams}
                  fallbackSortColumn="openRate"
                  searchPlaceholder="Search send windows"
                  emptyTitle="No send window data"
                  emptyDescription="Send-time analytics will appear here."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sent-log" className="space-y-6 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">Message Sent Log</h3>
              <p className="text-xs text-muted-foreground">
                Review campaign performance, suppressions, and delivery health.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Export CSV</Button>
              <Button variant="outline" size="sm">Back to Campaigns</Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Messages Sent" value="142" subtitle="This month" icon={Mail} variant="green" />
            <KpiCard title="Avg Open Rate" value="78.4%" subtitle="Across all sends" icon={CheckCircle2} variant="teal" />
            <KpiCard title="Opt-Outs" value="8" subtitle="This month" icon={MessageSquare} variant="amber" />
            <KpiCard title="Avg Recipients" value="200" subtitle="Per broadcast" icon={Users} variant="default" />
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Broadcast History</CardTitle>
            </CardHeader>
            <CardContent>
              <LocalTable
                data={broadcastHistory}
                columns={broadcastColumns}
                searchParams={sentLogSearchParams}
                fallbackSortColumn="sentAt"
                searchPlaceholder="Search by title or recipient"
                emptyTitle="No broadcasts found"
                emptyDescription="Sent broadcasts will appear here."
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ChannelMetric label="Push Notifications" summary="84 sent · 76% open rate" />
                <ChannelMetric label="SMS" summary="38 sent · 91% open rate" />
                <ChannelMetric label="Email" summary="20 sent · 72% open rate" />
                <div className="grid grid-cols-3 gap-3 border-t pt-4 text-sm">
                  <SummaryMetric label="Total delivered" value="139" className="text-emerald-600" />
                  <SummaryMetric label="Failed" value="3" className="text-red-600" />
                  <SummaryMetric label="Opt-outs" value="8" className="text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Opt-Out & Suppression List</CardTitle>
              </CardHeader>
              <CardContent>
                <LocalTable
                  data={suppressionList}
                  columns={suppressionColumns}
                  searchParams={suppressionSearchParams}
                  fallbackSortColumn="date"
                  searchPlaceholder="Search suppressions"
                  emptyTitle="No suppressions"
                  emptyDescription="Suppressed recipients will appear here."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LocalTable<TData extends { id: string }>({
  data,
  columns,
  searchParams,
  fallbackSortColumn,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
}: {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  searchParams: ReturnType<typeof createTableSearchParams>
  fallbackSortColumn: string
  searchPlaceholder: string
  emptyTitle: string
  emptyDescription: string
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
      <DataTableToolbar table={table} searchPlaceholder={searchPlaceholder} />
      <DataTable
        table={table}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    </div>
  )
}

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

const campaignColumns: ColumnDef<CampaignRow>[] = [
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

const audiencePerformanceColumns: ColumnDef<AnalyticsAudienceRow>[] = [
  { accessorKey: "audience", header: "Audience", enableHiding: false },
  {
    accessorKey: "channelMix",
    header: "Channel Mix",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.channelMix}</span>,
  },
  { accessorKey: "reach", header: "Reach" },
  {
    accessorKey: "openRate",
    header: "Open Rate",
    cell: ({ row }) => <span className="font-medium text-emerald-600">{row.original.openRate}</span>,
  },
  { accessorKey: "optOuts", header: "Opt-Outs" },
]

const sendWindowColumns: ColumnDef<SendWindowRow>[] = [
  { accessorKey: "window", header: "Time Window", enableHiding: false },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => <ChannelBadge value={row.original.channel} />,
  },
  { accessorKey: "sends", header: "Sends" },
  {
    accessorKey: "openRate",
    header: "Open Rate",
    cell: ({ row }) => <span className="font-medium text-emerald-600">{row.original.openRate}</span>,
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.note}</span>,
  },
]

function ChannelBadge({ value }: { value: BroadcastRow["channel"] | SuppressionRow["channel"] }) {
  if (value === "SMS") return <Badge variant="destructive">{value}</Badge>
  if (value === "Email") return <Badge variant="outline">{value}</Badge>
  if (value === "Push + SMS") return <Badge variant="default">{value}</Badge>
  return <Badge variant="secondary">{value}</Badge>
}

function StatusBadge({ value }: { value: CampaignRow["status"] }) {
  if (value === "Sent") return <Badge variant="default">{value}</Badge>
  if (value === "Scheduled") return <Badge variant="secondary">{value}</Badge>
  return <Badge variant="outline">{value}</Badge>
}
