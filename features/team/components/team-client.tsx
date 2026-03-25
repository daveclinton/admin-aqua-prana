"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Check,
  ClipboardList,
  Download,
  Minus,
  Search,
  Shield,
  UserPlus,
  Users,
} from "lucide-react"
import { parseAsStringLiteral, useQueryState } from "nuqs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  useTeamMembers,
  useTeamStats,
  useRolesConfig,
  useRemoveMember,
  useUpdateRoleConfig,
} from "@/features/team/hooks/use-team"
import { useAuditLogs } from "@/features/settings/hooks/use-audit-logs"
import { cn } from "@/lib/utils"
import type { TeamMemberDTO, TeamRole } from "@/features/team/types"

const teamTabs = ["members", "roles", "audit"] as const
type TeamTab = (typeof teamTabs)[number]

const ROLE_LABELS: Record<TeamRole, string> = {
  super_admin: "Super Admin",
  agent: "Agent",
  read_only: "Read-Only",
}

const ROLE_COLORS: Record<TeamRole, string> = {
  super_admin: "border-violet-200 bg-violet-50 text-violet-700",
  agent: "border-blue-200 bg-blue-50 text-blue-700",
  read_only: "border-slate-200 bg-slate-50 text-slate-600",
}

const STATUS_COLORS: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  invited: "border-amber-200 bg-amber-50 text-amber-700",
  suspended: "border-red-200 bg-red-50 text-red-600",
}

const INITIALS_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-slate-100 text-slate-600",
]

function getInitials(m: TeamMemberDTO) {
  const name = m.first_name && m.last_name
    ? `${m.first_name} ${m.last_name}`
    : m.name ?? m.email
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getDisplayName(m: TeamMemberDTO) {
  if (m.first_name || m.last_name) {
    return [m.first_name, m.last_name].filter(Boolean).join(" ")
  }
  return m.name ?? m.email
}

function formatLastActive(dateStr: string | null) {
  if (!dateStr) return "Never"
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? "s" : ""} ago`
}

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

  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const pageSize = 10

  const statsQuery = useTeamStats()
  const membersQuery = useTeamMembers({
    search: search || undefined,
    limit: pageSize,
    offset: page * pageSize,
  })
  const rolesQuery = useRolesConfig()
  const auditQuery = useAuditLogs({ limit: 20 })
  const removeMutation = useRemoveMember()
  const updateRoleMutation = useUpdateRoleConfig()

  const stats = statsQuery.data
  const members = membersQuery.data?.members ?? []
  const totalMembers = membersQuery.data?.total ?? 0

  const permissions = rolesQuery.data?.permissions ?? []
  const screens = rolesQuery.data?.screens ?? []

  const auditLogs = auditQuery.data?.logs ?? []

  // Build permission/screen matrices
  const allPermissions = [...new Set(permissions.map((p) => p.permission))]
  const allScreens = [...new Set(screens.map((s) => s.screen))]
  const roles: TeamRole[] = ["super_admin", "agent", "read_only"]

  function getPermGranted(role: string, perm: string) {
    return permissions.find((p) => p.role === role && p.permission === perm)?.granted ?? false
  }
  function getScreenGranted(role: string, screen: string) {
    return screens.find((s) => s.role === role && s.screen === screen)?.granted ?? false
  }

  function handleRemove(memberId: string) {
    removeMutation.mutate(memberId, {
      onSuccess: () => toast.success("Team member removed"),
      onError: () => toast.error("Failed to remove member"),
    })
  }

  function formatAuditDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

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
            {statsQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))
            ) : (
              <>
                <KpiCard title="Total Members" value={String(stats?.total ?? 0)} icon={Users} variant="default" />
                <KpiCard title="Super Admins" value={String(stats?.super_admins ?? 0)} icon={Shield} variant="default" />
                <KpiCard title="Support Agents" value={String(stats?.agents ?? 0)} icon={Users} variant="teal" />
                <KpiCard title="Pending Invite" value={String(stats?.pending_invites ?? 0)} icon={UserPlus} variant="amber" />
              </>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
            <Shield className="size-5 text-blue-600" />
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Screen Access Control:</span> Restrict which screens each team member can view and access.
            </p>
          </div>

          <Card className="rounded-2xl border border-border/80">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle>All Members</CardTitle>
                <div className="relative min-w-[220px]">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    className="h-8 rounded-full pl-8"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(0)
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              {membersQuery.isLoading ? (
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
                        <TableHead className="px-6">Member</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Screen Access</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="px-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((m, idx) => (
                        <TableRow key={m.id}>
                          <TableCell className="px-6">
                            <div className="flex items-center gap-3">
                              <div className={cn("flex size-8 items-center justify-center rounded-full text-xs font-semibold", INITIALS_COLORS[idx % INITIALS_COLORS.length])}>
                                {getInitials(m)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{getDisplayName(m)}</p>
                                {m.title && <p className="text-xs text-muted-foreground">{m.title}</p>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", ROLE_COLORS[m.team_role])}>
                              {ROLE_LABELS[m.team_role]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {m.team_role === "super_admin" ? (
                                <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px]">
                                  All screens
                                </Badge>
                              ) : (
                                (m.screens ?? []).map((s) => (
                                  <Badge key={s} variant="outline" className="rounded-full px-2 py-0.5 text-[10px] capitalize">
                                    {s}
                                  </Badge>
                                ))
                              )}
                              {m.team_role !== "super_admin" && (!m.screens || m.screens.length === 0) && (
                                <span className="text-xs text-muted-foreground">None</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", STATUS_COLORS[m.team_status] ?? STATUS_COLORS.active)}>
                              {m.team_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatLastActive(m.last_active_at)}
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="flex gap-2">
                              {m.team_status === "invited" && (
                                <Button variant="outline" size="sm" className="rounded-full border-amber-200 bg-amber-50 text-amber-700">
                                  Resend
                                </Button>
                              )}
                              {m.team_role !== "super_admin" && (
                                <Button variant="outline" size="sm" className="rounded-full">
                                  Edit Access
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {members.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                            No team members found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {totalMembers > pageSize && (
                    <div className="flex items-center justify-between border-t px-6 py-4 text-xs text-muted-foreground">
                      <span>Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalMembers)} of {totalMembers}</span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-7 rounded-full px-3" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" className="h-7 rounded-full px-3" disabled={(page + 1) * pageSize >= totalMembers} onClick={() => setPage((p) => p + 1)}>Next</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROLES & PERMISSIONS TAB */}
        <TabsContent value="roles" className="space-y-6 pt-4">
          {rolesQuery.isLoading ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {roles.map((role) => {
                  const memberCount = role === "super_admin" ? (stats?.super_admins ?? 0)
                    : role === "agent" ? (stats?.agents ?? 0)
                    : (stats?.read_only ?? 0)
                  const icon = role === "super_admin" ? Shield : role === "agent" ? Users : Check
                  const color = role === "super_admin" ? "text-violet-600" : role === "agent" ? "text-blue-600" : "text-slate-500"
                  const Icon = icon
                  return (
                    <Card key={role} className="rounded-2xl border border-border/80">
                      <CardContent className="flex items-start gap-3 p-5">
                        <Icon className={cn("mt-0.5 size-5", color)} />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">{ROLE_LABELS[role]}</p>
                          <p className="text-xs text-muted-foreground">{memberCount} members</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Action Permissions Matrix */}
              <Card className="rounded-2xl border border-border/80">
                <CardHeader>
                  <CardTitle>Action Permissions</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <Table>
                    <TableHeader className="bg-[#f1f5ef]">
                      <TableRow className="hover:bg-[#f1f5ef]">
                        <TableHead className="px-6">Permission</TableHead>
                        {roles.map((r) => (
                          <TableHead key={r} className="text-center">{ROLE_LABELS[r]}</TableHead>
                        ))}
                        <TableHead className="px-6 text-center">Custom</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allPermissions.map((perm) => (
                        <TableRow key={perm}>
                          <TableCell className="px-6 font-medium capitalize">
                            {perm.replace(/_/g, " ")}
                          </TableCell>
                          {roles.map((r) => (
                            <TableCell key={r}>
                              <div className="flex justify-center">
                                <PermCheck value={getPermGranted(r, perm)} />
                              </div>
                            </TableCell>
                          ))}
                          <TableCell className="px-6 text-center text-xs text-muted-foreground">
                            Configurable
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Screen Visibility Matrix */}
              <Card className="rounded-2xl border border-border/80">
                <CardHeader>
                  <CardTitle>Screen Visibility</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <Table>
                    <TableHeader className="bg-[#f1f5ef]">
                      <TableRow className="hover:bg-[#f1f5ef]">
                        <TableHead className="px-6">Screen</TableHead>
                        {roles.map((r) => (
                          <TableHead key={r} className="text-center">{ROLE_LABELS[r]}</TableHead>
                        ))}
                        <TableHead className="px-6 text-center">Custom</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allScreens.map((screen) => (
                        <TableRow key={screen}>
                          <TableCell className="px-6 font-medium capitalize">{screen}</TableCell>
                          {roles.map((r) => (
                            <TableCell key={r}>
                              <div className="flex justify-center">
                                <PermCheck value={getScreenGranted(r, screen)} />
                              </div>
                            </TableCell>
                          ))}
                          <TableCell className="px-6 text-center text-xs text-muted-foreground">
                            Configurable
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* AUDIT LOG TAB */}
        <TabsContent value="audit" className="space-y-6 pt-4">
          <Card className="rounded-2xl border border-border/80">
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
              {auditQuery.isLoading ? (
                <div className="space-y-3 px-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-[#f1f5ef]">
                    <TableRow className="hover:bg-[#f1f5ef]">
                      <TableHead className="px-6">Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="px-6">Actor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="px-6 text-sm text-muted-foreground">
                          {formatAuditDate(entry.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">{entry.action}</TableCell>
                        <TableCell className="px-6 text-sm text-muted-foreground">
                          {entry.user_name ?? entry.email}
                        </TableCell>
                      </TableRow>
                    ))}
                    {auditLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                          No audit entries found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
