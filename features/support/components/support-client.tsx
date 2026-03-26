"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  ChevronDown,
  Eye,
  Plus,
  Search,
  Star,
  TrendingUp,
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useTickets,
  useSupportStats,
  useAgentWorkload,
  useDataRequests,
  useUpdateDataRequest,
} from "@/features/support/hooks/use-support"
import { cn } from "@/lib/utils"
import type { TicketDTO } from "@/features/support/types"

function priorityBadge(priority: string) {
  switch (priority) {
    case "critical":
      return "border-red-200 bg-red-50 text-red-600"
    case "high":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "medium":
      return "border-blue-200 bg-blue-50 text-blue-700"
    default:
      return "border-slate-200 bg-slate-50 text-slate-600"
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "open":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "in_progress":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "resolved":
    case "closed":
      return "border-blue-200 bg-blue-50 text-blue-700"
    default:
      return "border-slate-200 bg-slate-50 text-slate-600"
  }
}

function formatSla(ticket: TicketDTO) {
  if (!ticket.sla_deadline) return { text: "—", color: "text-muted-foreground" }
  if (ticket.status === "resolved" || ticket.status === "closed") return { text: "Met", color: "text-emerald-600" }

  const remaining = new Date(ticket.sla_deadline).getTime() - Date.now()
  if (remaining <= 0) return { text: "BREACHED", color: "text-red-600" }

  const hrs = Math.floor(remaining / 3600000)
  if (hrs < 2) return { text: `${hrs}h left`, color: "text-amber-600" }
  return { text: `${hrs}h left`, color: "text-emerald-600" }
}

function dataRequestTypeBadge(type: string) {
  switch (type) {
    case "pond_data_export":
      return { label: "Pond Data Export", color: "border-blue-200 bg-blue-50 text-blue-700" }
    case "full_account_export":
      return { label: "Full Account Export", color: "border-violet-200 bg-violet-50 text-violet-700" }
    case "passbook_export":
      return { label: "Passbook Export", color: "border-emerald-200 bg-emerald-50 text-emerald-700" }
    default:
      return { label: type, color: "border-slate-200 bg-slate-50 text-slate-600" }
  }
}

function dataRequestStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return { color: "border-amber-200 bg-amber-50 text-amber-700" }
    case "approved":
      return { color: "border-emerald-200 bg-emerald-50 text-emerald-700" }
    case "rejected":
      return { color: "border-red-200 bg-red-50 text-red-600" }
    case "completed":
      return { color: "border-blue-200 bg-blue-50 text-blue-700" }
    default:
      return { color: "border-slate-200 bg-slate-50 text-slate-600" }
  }
}

const PRIORITY_PILLS = [
  { key: "critical", label: "Critical", color: "bg-red-500" },
  { key: "high", label: "High", color: "bg-amber-500" },
  { key: "medium", label: "Medium", color: "bg-blue-500" },
  { key: "low", label: "Low", color: "bg-slate-400" },
] as const

export function SupportClient() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const pageSize = 10

  const statsQuery = useSupportStats()
  const ticketsQuery = useTickets({
    search: search || undefined,
    limit: pageSize,
    offset: page * pageSize,
  })
  const agentsQuery = useAgentWorkload()
  const dataReqQuery = useDataRequests()
  const updateDataReqMutation = useUpdateDataRequest()

  const stats = statsQuery.data
  const tickets = ticketsQuery.data?.tickets ?? []
  const totalTickets = ticketsQuery.data?.total ?? 0
  const agents = agentsQuery.data?.agents ?? []
  const dataRequests = dataReqQuery.data?.requests ?? []
  const totalDataReqs = dataReqQuery.data?.total ?? 0

  function handleDataReqAction(id: string, status: string) {
    updateDataReqMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () => toast.success(`Request ${status}`),
        onError: () => toast.error("Failed to update request"),
      }
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Support</h2>
          <p className="text-sm text-muted-foreground">
            Manage support tickets, track SLA compliance, and monitor agent workload.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search tickets..." />
          </div>
          <Button className="rounded-full bg-[#1b4332] px-3 text-white hover:bg-[#244d39]">
            <Plus className="size-3.5" />
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Status pills + CSAT */}
      {statsQuery.isLoading ? (
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {PRIORITY_PILLS.map((pill) => (
            <div
              key={pill.key}
              className="flex items-center gap-2 rounded-full border px-4 py-2"
            >
              <span className={cn("size-2.5 rounded-full", pill.color)} />
              <span className="text-sm font-semibold">
                {stats?.[pill.key as keyof typeof stats] ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">{pill.label}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 rounded-full border px-4 py-2">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold">
              {stats?.csat_avg != null ? `${stats.csat_avg} / 5` : "— / 5"}
            </span>
            <span className="text-xs text-muted-foreground">CSAT</span>
          </div>
        </div>
      )}

      {/* Ticket Queue */}
      <Card className="rounded-2xl border border-border/80">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Ticket Queue</CardTitle>
            <div className="flex flex-col gap-2 lg:flex-row">
              <div className="relative min-w-[220px]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  className="h-8 rounded-full pl-8"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                />
              </div>
              {["All Priorities", "All Statuses", "All Agents"].map((filter) => (
                <Button
                  key={filter}
                  variant="outline"
                  className="h-8 justify-between rounded-full px-3"
                >
                  {filter}
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {ticketsQuery.isLoading ? (
            <div className="space-y-3 px-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-[#f1f5ef]">
                  <TableRow className="hover:bg-[#f1f5ef]">
                    <TableHead className="px-6">Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead className="px-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => {
                    const sla = formatSla(ticket)
                    return (
                      <TableRow key={ticket.id}>
                        <TableCell className="px-6 font-mono text-xs font-medium">
                          #{ticket.id.slice(0, 6)}
                        </TableCell>
                        <TableCell className="font-medium">{ticket.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 capitalize", priorityBadge(ticket.priority))}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 capitalize", statusBadge(ticket.status))}>
                            {ticket.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{ticket.agent_name ?? "Unassigned"}</TableCell>
                        <TableCell>
                          <span className={cn("text-sm font-medium", sla.color)}>
                            {sla.text}
                          </span>
                        </TableCell>
                        <TableCell className="px-6">
                          <Button variant="outline" size="sm" className="rounded-full">
                            <Eye className="size-3" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {tickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                        No tickets found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {totalTickets > pageSize && (
                <div className="flex items-center justify-between border-t px-6 py-4 text-xs text-muted-foreground">
                  <span>Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalTickets)} of {totalTickets}</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 rounded-full px-3" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" className="h-7 rounded-full px-3" disabled={(page + 1) * pageSize >= totalTickets} onClick={() => setPage((p) => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Resolution Tracking + Agent Workload */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border border-border/80">
          <CardHeader>
            <CardTitle>Resolution Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">SLA Compliance</span>
                    <span className="font-semibold text-emerald-600">{stats?.sla_compliance ?? 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${stats?.sla_compliance ?? 0}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border p-4 text-center">
                    <p className="text-2xl font-bold">
                      {stats?.avg_response_hrs != null ? `${stats.avg_response_hrs} hrs` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Response</p>
                  </div>
                  <div className="rounded-xl border p-4 text-center">
                    <p className="text-2xl font-bold">
                      {stats?.avg_resolution_hrs != null ? `${stats.avg_resolution_hrs} hrs` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Resolution</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80">
          <CardHeader>
            <CardTitle>Agent Workload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {agentsQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : agents.length > 0 ? (
              agents.map((agent) => {
                const maxTickets = Math.max(...agents.map((a) => a.open_tickets), 1)
                const widthPct = Math.round((agent.open_tickets / maxTickets) * 100)
                return (
                  <div key={agent.agent_id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{agent.agent_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {agent.open_tickets} open · SLA {agent.sla_compliance}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className={cn("h-1.5 rounded-full", agent.sla_compliance >= 90 ? "bg-emerald-500" : "bg-amber-500")}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="py-4 text-sm text-muted-foreground">No agents with assigned tickets.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Sending Requests */}
      <Card className="rounded-2xl border border-border/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Data Sending Requests</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {dataReqQuery.isLoading ? (
            <div className="space-y-3 px-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-[#f1f5ef]">
                  <TableRow className="hover:bg-[#f1f5ef]">
                    <TableHead className="px-6">Request ID</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="px-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataRequests.map((req) => {
                    const typeBadge = dataRequestTypeBadge(req.type)
                    const stsBadge = dataRequestStatusBadge(req.status)
                    return (
                      <TableRow key={req.id}>
                        <TableCell className="px-6 font-mono text-xs font-medium">
                          #{req.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-medium">{req.farmer_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", typeBadge.color)}>
                            {typeBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(req.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 capitalize", stsBadge.color)}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6">
                          {req.status === "pending" ? (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                                disabled={updateDataReqMutation.isPending}
                                onClick={() => handleDataReqAction(req.id, "approved")}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full border-red-200 bg-red-50 text-red-600"
                                disabled={updateDataReqMutation.isPending}
                                onClick={() => handleDataReqAction(req.id, "rejected")}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" className="rounded-full">
                              <Eye className="size-3" />
                              View
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {dataRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        No data requests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {totalDataReqs > 0 && (
                <div className="flex items-center justify-between border-t px-6 py-4 text-xs text-muted-foreground">
                  <span>Showing {dataRequests.length} of {totalDataReqs} requests</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
