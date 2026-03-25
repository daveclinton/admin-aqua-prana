"use client"

import {
  Check,
  ClipboardList,
  Download,
  Minus,
  Shield,
  UserPlus,
  Users,
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
import { TeamTableClient } from "@/features/team/components/team-table-client"
import { cn } from "@/lib/utils"

const teamTabs = ["members", "roles", "audit"] as const
type TeamTab = (typeof teamTabs)[number]

const members = [
  {
    initials: "SA",
    initialsColor: "bg-emerald-100 text-emerald-700",
    name: "Super Admin",
    subtitle: "(you)",
    email: "admin@aquaprana.com",
    role: "Super Admin",
    roleColor: "border-violet-200 bg-violet-50 text-violet-700",
    screens: ["All screens"],
    status: "Active",
    statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
    lastActive: "Now",
    actions: [],
  },
  {
    initials: "P",
    initialsColor: "bg-amber-100 text-amber-700",
    name: "Priya Sharma",
    subtitle: "Support Lead",
    email: "priya@aquaprana.com",
    role: "Agent",
    roleColor: "border-blue-200 bg-blue-50 text-blue-700",
    screens: ["Support", "Farmers", "Forum"],
    status: "Active",
    statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
    lastActive: "2 min ago",
    actions: ["Edit Access"],
  },
  {
    initials: "Z",
    initialsColor: "bg-blue-100 text-blue-700",
    name: "Zombie",
    subtitle: "Support Agent",
    email: "zombie@aquaprana.com",
    role: "Agent",
    roleColor: "border-blue-200 bg-blue-50 text-blue-700",
    screens: ["Support"],
    status: "Active",
    statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
    lastActive: "18 min ago",
    actions: ["Edit Access"],
  },
  {
    initials: "K",
    initialsColor: "bg-emerald-100 text-emerald-700",
    name: "Kamlesh",
    subtitle: "Support Agent",
    email: "kamlesh@aquaprana.com",
    role: "Agent",
    roleColor: "border-blue-200 bg-blue-50 text-blue-700",
    screens: ["Support", "Billing"],
    status: "Active",
    statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
    lastActive: "1 hr ago",
    actions: ["Edit Access"],
  },
  {
    initials: "R",
    initialsColor: "bg-slate-100 text-slate-600",
    name: "Ravi M",
    subtitle: "Analyst",
    email: "ravi@aquaprana.com",
    role: "Read-Only",
    roleColor: "border-slate-200 bg-slate-50 text-slate-600",
    screens: ["Analytics", "Billing"],
    status: "Invited",
    statusColor: "border-amber-200 bg-amber-50 text-amber-700",
    lastActive: "Never",
    actions: ["Resend"],
  },
  {
    initials: "A",
    initialsColor: "bg-violet-100 text-violet-700",
    name: "Anjali",
    subtitle: "Operations",
    email: "anjali@aquaprana.com",
    role: "Agent",
    roleColor: "border-blue-200 bg-blue-50 text-blue-700",
    screens: ["Marketplace", "Partners"],
    status: "Active",
    statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
    lastActive: "30 min ago",
    actions: ["Edit Access"],
  },
] as const

const roleCards = [
  { icon: Shield, label: "Super Admin", desc: "Full access to all screens and actions", members: 2, color: "text-violet-600" },
  { icon: Users, label: "Agent", desc: "Support and farmer-facing tasks", members: 4, color: "text-blue-600" },
  { icon: Check, label: "Read-Only", desc: "View data only, no edits", members: 1, color: "text-slate-500" },
] as const

const actionPermissions = [
  { permission: "View Farmers", superAdmin: true, agent: true, readOnly: true },
  { permission: "Suspend / Edit Farmer", superAdmin: true, agent: false, readOnly: false },
  { permission: "View & Reply Tickets", superAdmin: true, agent: true, readOnly: false },
  { permission: "Send Notifications / SMS", superAdmin: true, agent: false, readOnly: false },
  { permission: "Manage Marketplace", superAdmin: true, agent: false, readOnly: false },
  { permission: "View Analytics & Reports", superAdmin: true, agent: false, readOnly: true },
  { permission: "Manage Billing", superAdmin: true, agent: false, readOnly: false },
  { permission: "Manage Team & Roles", superAdmin: true, agent: false, readOnly: false },
] as const

const screenVisibility = [
  { screen: "Overview", superAdmin: true, agent: true, readOnly: true },
  { screen: "Farmers", superAdmin: true, agent: true, readOnly: true },
  { screen: "Passbook", superAdmin: true, agent: false, readOnly: false },
  { screen: "Forum", superAdmin: true, agent: true, readOnly: false },
  { screen: "Support", superAdmin: true, agent: true, readOnly: false },
  { screen: "Analytics", superAdmin: true, agent: false, readOnly: true },
  { screen: "Billing", superAdmin: true, agent: false, readOnly: false },
  { screen: "Team", superAdmin: true, agent: false, readOnly: false },
  { screen: "Settings", superAdmin: true, agent: true, readOnly: true },
] as const

const auditEntries = [
  { time: "Today 10:32 AM", action: "Profile updated", actor: "admin@aquaprana.com" },
  { time: "Today 9:15 AM", action: "Login — MacBook Pro / Chrome", actor: "admin@aquaprana.com" },
  { time: "Yesterday 3:45 PM", action: "Farmer suspended — bce Farmer", actor: "admin@aquaprana.com" },
  { time: "Yesterday 2:10 PM", action: "Team member invited — ravi@aquaprana.com", actor: "admin@aquaprana.com" },
  { time: "Mar 22, 2:00 PM", action: "Billing plan updated — Pro → Enterprise", actor: "admin@aquaprana.com" },
] as const

function PermCheck({ value }: { value: boolean }) {
  return value ? (
    <Check className="size-4 text-emerald-500" />
  ) : (
    <Minus className="size-4 text-slate-300" />
  )
}

export function TeamClient() {
  const [workspace, setWorkspace] = useQueryState(
    "tab",
    parseAsStringLiteral(teamTabs).withDefault("members")
  )

  const currentTab = workspace ?? "members"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Team & Roles</h2>
            <p className="text-sm text-muted-foreground">
              Manage team members, roles, screen access, and audit activity.
            </p>
          </div>
          <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
            Super Admin
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full">
            <Download className="size-3.5" />
            Export
          </Button>
          <Button className="rounded-full bg-[#1b4332] text-white hover:bg-[#244d39]">
            <UserPlus className="size-3.5" />
            Invite Member
          </Button>
        </div>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(value) => void setWorkspace(value as TeamTab)}
      >
        <TabsList variant="line" className="border-b pb-1">
          <TabsTrigger value="members" className="gap-1.5">
            <Users className="size-3.5" />
            Members
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5">
            <Shield className="size-3.5" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5">
            <ClipboardList className="size-3.5" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* MEMBERS TAB */}
        <TabsContent value="members" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Total Members" value="8" icon={Users} variant="default" />
            <KpiCard title="Super Admins" value="2" icon={Shield} variant="default" />
            <KpiCard title="Support Agents" value="4" icon={Users} variant="teal" />
            <KpiCard title="Pending Invite" value="1" icon={UserPlus} variant="amber" />
          </div>

          {/* Screen Access Info Banner */}
          <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
            <Shield className="size-5 text-blue-600" />
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Screen Access Control:</span> Restrict which screens each team member can view and access.
            </p>
          </div>

          {/* Members Table */}
          <Card className="rounded-2xl border border-border/80 py-0">
            <CardHeader>
              <CardTitle>All Members</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader className="bg-[#f1f5ef]">
                  <TableRow className="hover:bg-[#f1f5ef]">
                    <TableHead className="px-4">Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Screen Access</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="px-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => (
                    <TableRow key={m.email}>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("flex size-8 items-center justify-center rounded-full text-xs font-semibold", m.initialsColor)}>
                            {m.initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.subtitle}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", m.roleColor)}>
                          {m.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {m.screens.map((s) => (
                            <Badge key={s} variant="outline" className="rounded-full px-2 py-0.5 text-[10px]">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", m.statusColor)}>
                          {m.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.lastActive}</TableCell>
                      <TableCell className="px-4">
                        <div className="flex gap-2">
                          {m.actions.map((action) => (
                            <Button
                              key={action}
                              variant="outline"
                              size="sm"
                              className={cn(
                                "rounded-full",
                                action === "Resend" && "border-amber-200 bg-amber-50 text-amber-700"
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
              <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
                <span>Showing 6 of 8 members</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 rounded-full px-3" disabled>Previous</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-full px-3">Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROLES & PERMISSIONS TAB */}
        <TabsContent value="roles" className="space-y-6 pt-4">
          {/* Role Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {roleCards.map((role) => (
              <Card key={role.label} className="rounded-2xl border border-border/80 py-0">
                <CardContent className="flex items-start gap-3 p-5">
                  <role.icon className={cn("mt-0.5 size-5", role.color)} />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{role.label}</p>
                    <p className="text-xs text-muted-foreground">{role.desc}</p>
                    <p className="text-xs text-muted-foreground">{role.members} members</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Permissions Matrix */}
          <Card className="rounded-2xl border border-border/80 py-0">
            <CardHeader>
              <CardTitle>Action Permissions</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader className="bg-[#f1f5ef]">
                  <TableRow className="hover:bg-[#f1f5ef]">
                    <TableHead className="px-4">Permission</TableHead>
                    <TableHead className="text-center">Super Admin</TableHead>
                    <TableHead className="text-center">Agent</TableHead>
                    <TableHead className="text-center">Read-Only</TableHead>
                    <TableHead className="px-4 text-center">Custom</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actionPermissions.map((row) => (
                    <TableRow key={row.permission}>
                      <TableCell className="px-4 font-medium">{row.permission}</TableCell>
                      <TableCell className="text-center"><PermCheck value={row.superAdmin} /></TableCell>
                      <TableCell className="text-center"><PermCheck value={row.agent} /></TableCell>
                      <TableCell className="text-center"><PermCheck value={row.readOnly} /></TableCell>
                      <TableCell className="px-4 text-center text-xs text-muted-foreground">Configurable</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Screen Visibility Matrix */}
          <Card className="rounded-2xl border border-border/80 py-0">
            <CardHeader>
              <CardTitle>Screen Visibility</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader className="bg-[#f1f5ef]">
                  <TableRow className="hover:bg-[#f1f5ef]">
                    <TableHead className="px-4">Screen</TableHead>
                    <TableHead className="text-center">Super Admin</TableHead>
                    <TableHead className="text-center">Agent</TableHead>
                    <TableHead className="text-center">Read-Only</TableHead>
                    <TableHead className="px-4 text-center">Custom</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {screenVisibility.map((row) => (
                    <TableRow key={row.screen}>
                      <TableCell className="px-4 font-medium">{row.screen}</TableCell>
                      <TableCell className="text-center"><PermCheck value={row.superAdmin} /></TableCell>
                      <TableCell className="text-center"><PermCheck value={row.agent} /></TableCell>
                      <TableCell className="text-center"><PermCheck value={row.readOnly} /></TableCell>
                      <TableCell className="px-4 text-center text-xs text-muted-foreground">Configurable</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT LOG TAB */}
        <TabsContent value="audit" className="space-y-6 pt-4">
          <Card className="rounded-2xl border border-border/80 py-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Audit Log</CardTitle>
                <Button variant="outline" className="rounded-full">
                  <Download className="size-3.5" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader className="bg-[#f1f5ef]">
                  <TableRow className="hover:bg-[#f1f5ef]">
                    <TableHead className="px-4">Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="px-4">Actor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditEntries.map((entry, i) => (
                    <TableRow key={i}>
                      <TableCell className="px-4 text-sm text-muted-foreground">{entry.time}</TableCell>
                      <TableCell className="font-medium">{entry.action}</TableCell>
                      <TableCell className="px-4 text-sm text-muted-foreground">{entry.actor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
