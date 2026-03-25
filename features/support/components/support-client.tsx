"use client"

import { useState } from "react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const statusPills = [
  { label: "Critical", count: 10, color: "bg-red-500" },
  { label: "High", count: 3, color: "bg-amber-500" },
  { label: "Medium", count: 7, color: "bg-blue-500" },
  { label: "Low", count: 5, color: "bg-slate-400" },
] as const

const tickets = [
  {
    id: "#1",
    subject: "Shrimp mortality spike — Pond 4",
    priority: "High",
    status: "Open",
    agent: "Priya",
    sla: "4h left",
    slaColor: "text-emerald-600",
  },
  {
    id: "#2",
    subject: "Sensor malfunction — DO probe",
    priority: "Critical",
    status: "In Progress",
    agent: "Zombie",
    sla: "1h left",
    slaColor: "text-amber-600",
  },
  {
    id: "#5",
    subject: "Billing query — Pro plan renewal",
    priority: "Low",
    status: "Returned",
    agent: "Kamlesh",
    sla: "12h left",
    slaColor: "text-emerald-600",
  },
  {
    id: "#6",
    subject: "App crash on Android — feed log",
    priority: "High",
    status: "Open",
    agent: "Priya",
    sla: "2h left",
    slaColor: "text-amber-600",
  },
  {
    id: "#7",
    subject: "Water quality alert not triggering",
    priority: "Critical",
    status: "In Progress",
    agent: "Zombie",
    sla: "BREACHED",
    slaColor: "text-red-600",
  },
] as const

const dataRequests = [
  {
    id: "#DR-001",
    farmer: "XYZ Farmer",
    type: "Pond Data Export",
    typeColor: "border-blue-200 bg-blue-50 text-blue-700",
    date: "Feb 18",
    status: "Pending",
    statusColor: "border-amber-200 bg-amber-50 text-amber-700",
    action: "Review",
  },
  {
    id: "#DR-002",
    farmer: "Suresh Kumar",
    type: "Full Account Export",
    typeColor: "border-violet-200 bg-violet-50 text-violet-700",
    date: "Feb 17",
    status: "Approved",
    statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
    action: "View",
  },
] as const

const agents = [
  { name: "Priya", open: 6, sla: "94%", barWidth: "w-[60%]", barColor: "bg-amber-500" },
  { name: "Zombie", open: 4, sla: "100%", barWidth: "w-[40%]", barColor: "bg-emerald-500" },
  { name: "Kamlesh", open: 2, sla: "88%", barWidth: "w-[20%]", barColor: "bg-emerald-500" },
] as const

function priorityBadge(priority: string) {
  switch (priority) {
    case "Critical":
      return "border-red-200 bg-red-50 text-red-600"
    case "High":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "Medium":
      return "border-blue-200 bg-blue-50 text-blue-700"
    default:
      return "border-slate-200 bg-slate-50 text-slate-600"
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "Open":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "In Progress":
      return "border-amber-200 bg-amber-50 text-amber-700"
    default:
      return "border-slate-200 bg-slate-50 text-slate-600"
  }
}

export function SupportClient() {
  const [search, setSearch] = useState("")

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
      <div className="flex flex-wrap items-center gap-3">
        {statusPills.map((pill) => (
          <div
            key={pill.label}
            className="flex items-center gap-2 rounded-full border px-4 py-2"
          >
            <span className={cn("size-2.5 rounded-full", pill.color)} />
            <span className="text-sm font-semibold">{pill.count}</span>
            <span className="text-xs text-muted-foreground">{pill.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 rounded-full border px-4 py-2">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold">4.2 / 5</span>
          <span className="text-xs text-muted-foreground">CSAT</span>
          <Badge
            variant="outline"
            className="rounded-full border-emerald-200 bg-emerald-50 px-1.5 text-[0.625rem] text-emerald-700"
          >
            <TrendingUp className="mr-0.5 size-2.5" />
            0.3 vs last week
          </Badge>
        </div>
      </div>

      {/* Ticket Queue */}
      <Card className="rounded-2xl border border-border/80 py-0">
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
                  onChange={(e) => setSearch(e.target.value)}
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
          <Table>
            <TableHeader className="bg-[#f1f5ef]">
              <TableRow className="hover:bg-[#f1f5ef]">
                <TableHead className="px-4">Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead className="px-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="px-4 font-mono text-xs font-medium">
                    {ticket.id}
                  </TableCell>
                  <TableCell className="font-medium">{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("rounded-full px-2.5 py-1", priorityBadge(ticket.priority))}
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("rounded-full px-2.5 py-1", statusBadge(ticket.status))}
                    >
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.agent}</TableCell>
                  <TableCell>
                    <span className={cn("text-sm font-medium", ticket.slaColor)}>
                      {ticket.sla}
                    </span>
                  </TableCell>
                  <TableCell className="px-4">
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Eye className="size-3" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
            <span>Showing 5 of 25 tickets</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 rounded-full px-3" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="h-7 rounded-full px-3">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resolution Tracking + Agent Workload */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border border-border/80 py-0">
          <CardHeader>
            <CardTitle>Resolution Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">SLA Compliance</span>
                <span className="font-semibold text-emerald-600">94%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[94%] rounded-full bg-emerald-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-4 text-center">
                <p className="text-2xl font-bold">2.3 hrs</p>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </div>
              <div className="rounded-xl border p-4 text-center">
                <p className="text-2xl font-bold">6.3 hrs</p>
                <p className="text-xs text-muted-foreground">Avg Resolution</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 py-0">
          <CardHeader>
            <CardTitle>Agent Workload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{agent.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {agent.open} open · SLA {agent.sla}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div
                    className={cn("h-1.5 rounded-full", agent.barWidth, agent.barColor)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Data Sending Requests */}
      <Card className="rounded-2xl border border-border/80 py-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Data Sending Requests</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader className="bg-[#f1f5ef]">
              <TableRow className="hover:bg-[#f1f5ef]">
                <TableHead className="px-4">Request ID</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="px-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="px-4 font-mono text-xs font-medium">
                    {req.id}
                  </TableCell>
                  <TableCell className="font-medium">{req.farmer}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("rounded-full px-2.5 py-1", req.typeColor)}
                    >
                      {req.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{req.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("rounded-full px-2.5 py-1", req.statusColor)}
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4">
                    <Button variant="outline" size="sm" className="rounded-full">
                      {req.action}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
            <span>Showing 2 of 2 requests</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 rounded-full px-3" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="h-7 rounded-full px-3" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
