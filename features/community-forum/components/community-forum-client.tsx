"use client"

import { useMemo, useState } from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock3,
  Flag,
  Gavel,
  Megaphone,
  MessageCircle,
  Pin,
  Search,
  Shield,
  Users,
  UserPlus,
  Video,
  X,
} from "lucide-react"
import { parseAsStringLiteral, useQueryState, useQueryStates } from "nuqs"
import { toast } from "sonner"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { DataTable } from "@/components/table/data-table"
import { DataTableToolbar } from "@/components/table/data-table-toolbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { useDataTable } from "@/hooks/table/use-data-table"
import type { DataTableState } from "@/lib/table/table-types"
import {
  createTableSearchParams,
  parseSortingState,
} from "@/lib/table/table-search-params"
import { getSortingValue, resolveUpdater } from "@/lib/table/table-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  useForumStats,
  useTrendingTopics,
  useExperts,
  useUpdateExpert,
  useContentList,
  useContentStats,
  useContentPerformance,
  useContentCategories,
  useUpdateContent,
  useModerationStats,
  useModerationQueue,
  useModerationAction,
  usePinPost,
} from "@/features/community-forum/hooks/use-forum"
import type {
  ForumContentDTO,
  ModerationQueueItemDTO,
} from "@/features/community-forum/types"

const workspaceTabs = ["discussions", "moderation"] as const
type WorkspaceTab = (typeof workspaceTabs)[number]

const discussionContentSearchParams = createTableSearchParams({
  defaultPageSize: 6,
  defaultSort: "published.desc",
  urlKeys: { globalFilter: "contentQ", pageIndex: "contentPage", pageSize: "contentSize", sort: "contentSort" },
})

const moderationContentSearchParams = createTableSearchParams({
  defaultPageSize: 4,
  defaultSort: "reports.desc",
  urlKeys: { globalFilter: "reviewQ", pageIndex: "reviewPage", pageSize: "reviewSize", sort: "reviewSort" },
})

/* ── Row types for local tables ── */

type DiscussionContentRow = {
  id: string
  title: string
  type: string
  category: string
  author: string
  views: string
  readRate: string
  published: string
  status: string
  actions: string[]
  _contentId: string
}

type ModerationContentRow = {
  id: string
  title: string
  type: string
  reason: string
  flaggedBy: string
  reports: string
  published: string
  status: string
  actions: { label: string; tone: "red" | "green" | "slate" }[]
  _targetType: "post" | "reply" | "content"
  _targetId: string
}

/* ── Helper functions (unchanged styling) ── */

function moderationBadgeStyles(tone: "red" | "amber" | "green" | "blue" | "slate") {
  switch (tone) {
    case "red":
      return "border-red-200 bg-red-50 text-red-600"
    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "green":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "blue":
      return "border-sky-200 bg-sky-50 text-sky-700"
    default:
      return "border-slate-200 bg-slate-50 text-slate-700"
  }
}

function moderationActionStyles(tone: "red" | "green" | "purple" | "slate") {
  switch (tone) {
    case "red":
      return "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
    case "green":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
    case "purple":
      return "border-violet-200 bg-violet-600 text-white hover:bg-violet-500"
    default:
      return "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
  }
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`.replace(".0k", "k")
  return String(n)
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} minutes ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

function formatContentRow(item: ForumContentDTO, index: number): DiscussionContentRow {
  const isPub = item.status === "published"
  return {
    id: item.id,
    title: item.title,
    type: item.type === "video" ? "Video" : "Article",
    category: item.category ?? "—",
    author: item.author_name,
    views: isPub ? formatNumber(item.views) : "—",
    readRate: item.read_rate != null ? `${item.read_rate}%` : "—",
    published: item.published_at
      ? new Date(item.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Not published",
    status: isPub ? "Published" : item.status === "archived" ? "Archived" : "Draft",
    actions: isPub ? ["Edit", "Archive"] : ["Edit & Publish"],
    _contentId: item.id,
  }
}

function formatModerationContentRow(item: ModerationQueueItemDTO): ModerationContentRow {
  const isUrgent = item.report_count >= 10
  return {
    id: item.report_id,
    title: `${item.body_excerpt.slice(0, 60)}...`,
    type: item.target_type === "content" ? "Article" : "Forum Post",
    reason: item.reason,
    flaggedBy: `${item.report_count} users`,
    reports: String(item.report_count),
    published: "Active",
    status: isUrgent ? "Urgent" : "Needs Update",
    actions:
      item.target_type === "content"
        ? [
            { label: "Edit Article", tone: "green" as const },
            { label: "Dismiss", tone: "slate" as const },
          ]
        : [
            { label: "Remove", tone: "red" as const },
            { label: "Review", tone: "slate" as const },
          ],
    _targetType: item.target_type,
    _targetId: item.target_id,
  }
}

/* ── Skeleton helpers ── */

function KpiSkeleton() {
  return <Skeleton className="h-[100px] w-full rounded-2xl" />
}

function CardListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start justify-between gap-4 border-t border-border/60 py-3 first:border-t-0 first:pt-0">
          <div className="flex items-start gap-3">
            <Skeleton className="mt-0.5 size-6 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function CommunityForumClient() {
  const [workspace, setWorkspace] = useQueryState(
    "workspace",
    parseAsStringLiteral(workspaceTabs).withDefault("discussions")
  )
  const [moderationFilter, setModerationFilter] = useState<string | undefined>(undefined)

  const currentWorkspace = workspace ?? "discussions"

  /* ── Queries ── */
  const forumStats = useForumStats()
  const trendingTopics = useTrendingTopics()
  const expertsQuery = useExperts({ limit: 5 })
  const contentList = useContentList()
  const contentStats = useContentStats()
  const contentPerf = useContentPerformance()
  const contentCategories = useContentCategories()
  const moderationStats = useModerationStats()
  const moderationQueue = useModerationQueue({ reason: moderationFilter, limit: 10 })
  const flaggedContent = useModerationQueue({ target_type: "content" })

  /* ── Mutations ── */
  const updateExpert = useUpdateExpert()
  const updateContent = useUpdateContent()
  const moderationAction = useModerationAction()
  const pinPost = usePinPost()

  /* ── Derived data ── */
  const discussionContentTableRows: DiscussionContentRow[] = useMemo(
    () => (contentList.data?.items ?? []).map((item, i) => formatContentRow(item, i)),
    [contentList.data]
  )

  const moderationContentTableRows: ModerationContentRow[] = useMemo(
    () => (flaggedContent.data?.items ?? []).map((item) => formatModerationContentRow(item)),
    [flaggedContent.data]
  )

  /* ── Moderation filter chips ── */
  const countsByReason = moderationQueue.data?.counts_by_reason ?? {}
  const totalModerationCount = moderationStats.data?.pending_review ?? 0
  const moderationFilterChips = useMemo(() => {
    const chips: { label: string; count: number; active: boolean }[] = [
      { label: "All", count: totalModerationCount, active: moderationFilter === undefined },
    ]
    for (const [reason, count] of Object.entries(countsByReason)) {
      chips.push({ label: reason, count, active: moderationFilter === reason })
    }
    return chips
  }, [countsByReason, totalModerationCount, moderationFilter])

  /* ── Content performance rows ── */
  const perfRows = useMemo(() => {
    if (!contentPerf.data) return []
    const d = contentPerf.data
    return [
      { label: "Avg completion rate", value: d.avg_completion_rate != null ? `${d.avg_completion_rate}%` : "—" },
      { label: "Top performing", value: d.top_performing?.title ?? "—" },
      { label: "Most shared", value: d.most_shared?.title ?? "—" },
      { label: "Needs update (30 days)", value: `${d.needs_update} articles` },
      { label: "Awaiting approval", value: `${d.awaiting_approval} drafts` },
    ]
  }, [contentPerf.data])

  /* ── Category view bars ── */
  const categoryViewBars = useMemo(() => {
    if (!contentPerf.data?.views_by_category?.length) return []
    const cats = contentPerf.data.views_by_category
    const maxViews = Math.max(...cats.map((c) => c.views), 1)
    const colors = ["bg-blue-500", "bg-red-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500"]
    return cats.map((c, i) => ({
      label: c.category,
      value: formatNumber(c.views),
      widthPercent: Math.round((c.views / maxViews) * 100),
      color: colors[i % colors.length],
    }))
  }, [contentPerf.data])

  /* ── Column defs (content table) ── */
  const discussionContentColumns: ColumnDef<DiscussionContentRow>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "rounded-full px-2.5 py-1",
              row.original.type === "Video"
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
            )}
          >
            {row.original.type}
          </Badge>
        ),
      },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "author", header: "Author" },
      { accessorKey: "views", header: "Views" },
      {
        accessorKey: "readRate",
        header: "Read %",
        cell: ({ row }) => {
          const rate = parseInt(row.original.readRate)
          return (
            <span
              className={cn(
                !isNaN(rate) && rate >= 70
                  ? "text-emerald-600"
                  : !isNaN(rate) && rate < 65
                    ? "text-amber-600"
                    : "text-muted-foreground"
              )}
            >
              {row.original.readRate}
            </span>
          )
        },
      },
      { accessorKey: "published", header: "Published" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "rounded-full px-2.5 py-1",
              row.original.status === "Published"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            )}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.actions.map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full text-[0.625rem]",
                  action === "Edit & Publish"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : ""
                )}
                onClick={() => {
                  const id = row.original._contentId
                  if (action === "Archive") {
                    updateContent.mutate(
                      { id, data: { status: "archived" } },
                      {
                        onSuccess: () => toast.success("Content archived"),
                        onError: () => toast.error("Failed to archive content"),
                      }
                    )
                  } else if (action === "Edit & Publish") {
                    updateContent.mutate(
                      { id, data: { status: "published" } },
                      {
                        onSuccess: () => toast.success("Content published"),
                        onError: () => toast.error("Failed to publish content"),
                      }
                    )
                  } else if (action === "Edit") {
                    toast.info("Edit content: navigate to content editor")
                  }
                }}
              >
                {action}
              </Button>
            ))}
          </div>
        ),
      },
    ],
    [updateContent]
  )

  /* ── Column defs (moderation content table) ── */
  const moderationContentColumns: ColumnDef<ModerationContentRow>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn("rounded-full px-2.5 py-1", moderationBadgeStyles("blue"))}
          >
            {row.original.type}
          </Badge>
        ),
      },
      {
        accessorKey: "reason",
        header: "Flag Reason",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "rounded-full px-2.5 py-1",
              moderationBadgeStyles(
                row.original.reason === "Misinformation" || row.original.reason === "Safety Risk"
                  ? "red"
                  : "amber"
              )
            )}
          >
            {row.original.reason}
          </Badge>
        ),
      },
      { accessorKey: "flaggedBy", header: "Flagged By" },
      { accessorKey: "reports", header: "Reports" },
      { accessorKey: "published", header: "Published" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "rounded-full px-2.5 py-1",
              moderationBadgeStyles(
                row.original.status === "Urgent" || row.original.status === "Under Review"
                  ? "red"
                  : "amber"
              )
            )}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.actions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-lg border text-xs shadow-none",
                  moderationActionStyles(action.tone)
                )}
                onClick={() => {
                  const r = row.original
                  if (action.label === "Remove" || action.label === "Unpublish") {
                    moderationAction.mutate(
                      { target_type: r._targetType, target_id: r._targetId, action: "remove" },
                      {
                        onSuccess: () => toast.success("Content removed"),
                        onError: () => toast.error("Failed to remove content"),
                      }
                    )
                  } else if (action.label === "Dismiss") {
                    moderationAction.mutate(
                      { target_type: r._targetType, target_id: r._targetId, action: "keep" },
                      {
                        onSuccess: () => toast.success("Report dismissed"),
                        onError: () => toast.error("Failed to dismiss report"),
                      }
                    )
                  } else if (action.label === "Edit Article" || action.label === "Edit") {
                    toast.info("Navigate to content editor")
                  } else if (action.label === "Review") {
                    toast.info("Navigate to review details")
                  }
                }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ),
      },
    ],
    [moderationAction]
  )

  return (
    <div className="space-y-6">
      <Tabs
        value={currentWorkspace}
        onValueChange={(value) => void setWorkspace(value as WorkspaceTab)}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Community Forum</h2>
            <p className="text-sm text-muted-foreground">
              Manage discussions, experts, content, and moderation from one shared workspace.
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

        <TabsList variant="line" className="border-b pb-1">
          <TabsTrigger value="discussions" className="gap-1.5">
            <MessageCircle className="size-3.5" />
            Discussions
          </TabsTrigger>
          <TabsTrigger value="moderation" className="gap-1.5">
            <Shield className="size-3.5" />
            Moderation ({moderationStats.isLoading ? "..." : moderationStats.data?.pending_review ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="space-y-6 pt-4">
          <div className="flex justify-end">
            <Button
              className="rounded-full bg-[#1b4332] px-3 text-white hover:bg-[#244d39]"
              onClick={() => {
                toast.info("Select a post to pin as announcement")
              }}
            >
              <Megaphone className="size-3.5" />
              Pin Announcement
            </Button>
          </div>

          {/* ── Discussion KPIs ── */}
          {forumStats.isLoading ? (
            <div className="grid gap-4 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <KpiSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-4">
              <KpiCard
                title="Active Discussions"
                value={formatNumber(forumStats.data?.active_discussions ?? 0)}
                icon={MessageCircle}
                variant="default"
              />
              <KpiCard
                title="Total Posts"
                value={formatNumber(forumStats.data?.total_posts ?? 0)}
                icon={MessageCircle}
                variant="default"
              />
              <KpiCard
                title="Active Members"
                value={formatNumber(forumStats.data?.active_members ?? 0)}
                icon={Users}
                variant="default"
              />
              <KpiCard
                title="Flagged Content"
                value={String(forumStats.data?.flagged_content ?? 0)}
                icon={Flag}
                variant="red"
              />
            </div>
          )}

          {/* ── Trending + Expert Directory ── */}
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl border border-border/80 py-0">
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.isLoading ? (
                  <CardListSkeleton rows={3} />
                ) : !trendingTopics.data?.topics?.length ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No trending topics yet
                  </p>
                ) : (
                  trendingTopics.data.topics.map((topic, index) => (
                    <div
                      key={topic.id}
                      className="flex items-start justify-between gap-4 border-t border-border/60 py-3 first:border-t-0 first:pt-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-emerald-50 text-[0.625rem] font-semibold text-emerald-700">
                          {index + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">{topic.title}</p>
                          <p className="text-xs text-muted-foreground">{timeAgo(topic.created_at)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(topic.views)} views &middot; {topic.reply_count} replies
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full",
                          topic.trend === "trending"
                            ? "border-orange-200 bg-orange-50 text-orange-600"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        )}
                      >
                        {topic.trend === "trending" ? "Trending" : "Rising"}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/80 py-0">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle>Expert Directory</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative min-w-[180px]">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search experts..."
                        className="h-8 rounded-full pl-8"
                      />
                    </div>
                    <Button variant="outline" className="h-8 rounded-full px-3">
                      <UserPlus className="size-3.5" />
                      Add Expert
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {expertsQuery.isLoading ? (
                  <CardListSkeleton rows={3} />
                ) : !expertsQuery.data?.experts?.length ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No experts found
                  </p>
                ) : (
                  expertsQuery.data.experts.map((expert, index) => (
                    <div
                      key={expert.id}
                      className="flex items-start justify-between gap-4 border-t border-border/60 py-3 first:border-t-0 first:pt-0"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 flex size-6 items-center justify-center rounded-full text-[0.625rem] font-semibold",
                            index === 2
                              ? "bg-violet-100 text-violet-700"
                              : "bg-emerald-50 text-emerald-700"
                          )}
                        >
                          {expert.name.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{expert.name}</p>
                            {expert.status !== "pending" ? (
                              <span className="text-xs text-amber-500">★★★★★</span>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {expert.specialty}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {expert.status === "pending"
                              ? "Pending review"
                              : expert.rating != null
                                ? String(expert.rating)
                                : "—"}
                          </p>
                        </div>
                      </div>
                      {expert.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            className="h-6 rounded-full bg-[#1b4332] px-2.5 text-[0.625rem] text-white hover:bg-[#244d39]"
                            onClick={() =>
                              updateExpert.mutate(
                                { id: expert.id, data: { status: "verified" } },
                                {
                                  onSuccess: () => toast.success(`${expert.name} verified`),
                                  onError: () => toast.error("Failed to verify expert"),
                                }
                              )
                            }
                          >
                            Verify
                          </Button>
                          <Button
                            variant="outline"
                            className="h-6 rounded-full border-red-200 bg-red-50 px-2.5 text-[0.625rem] text-red-600"
                            onClick={() =>
                              updateExpert.mutate(
                                { id: expert.id, data: { status: "denied" } },
                                {
                                  onSuccess: () => toast.success(`${expert.name} denied`),
                                  onError: () => toast.error("Failed to deny expert"),
                                }
                              )
                            }
                          >
                            Deny
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Content Library ── */}
          <div className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MessageCircle className="size-4 text-[#1b4332]" />
                  Content Library
                </div>
                <p className="text-xs text-muted-foreground">
                  Articles, videos and guides published to farmers
                </p>
              </div>
              <Button
                className="rounded-full bg-[#1b4332] px-3 text-white hover:bg-[#244d39]"
                onClick={() => toast.info("Navigate to new content form")}
              >
                + New Content
              </Button>
            </div>

            {/* ── Content KPIs ── */}
            {contentStats.isLoading ? (
              <div className="grid gap-3 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <KpiSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 xl:grid-cols-5">
                <KpiCard
                  title="Total Articles"
                  value={String(contentStats.data?.total_articles ?? 0)}
                  icon={MessageCircle}
                  variant="default"
                />
                <KpiCard
                  title="Videos"
                  value={String(contentStats.data?.total_videos ?? 0)}
                  icon={Video}
                  variant="default"
                />
                <KpiCard
                  title="Drafts"
                  value={String(contentStats.data?.total_drafts ?? 0)}
                  icon={Clock3}
                  variant="amber"
                />
                <KpiCard
                  title="Total Views"
                  value={formatNumber(contentStats.data?.total_views ?? 0)}
                  icon={Users}
                  variant="green"
                />
                <KpiCard
                  title="Avg Read Rate"
                  value={contentStats.data?.avg_read_rate != null ? `${contentStats.data.avg_read_rate}%` : "—"}
                  icon={Check}
                  variant="teal"
                />
              </div>
            )}

            {/* ── All Content table ── */}
            <Card className="rounded-2xl border border-border/80 py-0">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle>All Content</CardTitle>
                  <div className="flex flex-col gap-2 lg:flex-row">
                    <div className="relative min-w-[220px]">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search content..."
                        className="h-8 rounded-full pl-8"
                      />
                    </div>
                    {["All Types", "All Categories", "All Status"].map((filter) => (
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
              <CardContent>
                {contentList.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <LocalTable
                    data={discussionContentTableRows}
                    columns={discussionContentColumns}
                    searchParams={discussionContentSearchParams}
                    fallbackSortColumn="published"
                    searchPlaceholder="Search content..."
                    emptyTitle="No content found"
                    emptyDescription="Published articles, videos, and drafts will appear here."
                    showToolbar={false}
                    footerNote={`Showing ${discussionContentTableRows.length} of ${contentList.data?.total ?? 0} items`}
                  />
                )}
              </CardContent>
            </Card>

            {/* ── Categories + Performance ── */}
            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="rounded-2xl border border-border/80 py-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Content Categories</CardTitle>
                    <Button
                      variant="outline"
                      className="h-8 rounded-full px-3"
                      onClick={() => toast.info("Navigate to add category form")}
                    >
                      + Add Category
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  {contentCategories.isLoading ? (
                    <div className="space-y-3 px-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : !contentCategories.data?.categories?.length ? (
                    <p className="px-4 py-4 text-center text-sm text-muted-foreground">
                      No categories yet
                    </p>
                  ) : (
                    <Table>
                      <TableHeader className="bg-[#f1f5ef]">
                        <TableRow className="hover:bg-[#f1f5ef]">
                          <TableHead className="px-4">Category</TableHead>
                          <TableHead>Articles</TableHead>
                          <TableHead>Videos</TableHead>
                          <TableHead>Total Views</TableHead>
                          <TableHead className="px-4">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contentCategories.data.categories.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="px-4 font-medium">
                              {row.name}
                            </TableCell>
                            <TableCell>{row.article_count}</TableCell>
                            <TableCell>{row.video_count}</TableCell>
                            <TableCell>{formatNumber(row.total_views)}</TableCell>
                            <TableCell className="px-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                onClick={() => toast.info(`Edit category: ${row.name}`)}
                              >
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-border/80 py-0">
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contentPerf.isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-6 w-full" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {perfRows.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between border-b border-border/60 pb-2 text-sm last:border-b-0 last:pb-0"
                          >
                            <span className="text-muted-foreground">{item.label}</span>
                            <span
                              className={cn(
                                "font-medium",
                                item.label.includes("Needs") || item.label.includes("Awaiting")
                                  ? "text-amber-600"
                                  : ""
                              )}
                            >
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                          Views By Category
                        </p>
                        {categoryViewBars.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No category data yet</p>
                        ) : (
                          categoryViewBars.map((bar) => (
                            <div key={bar.label} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{bar.label}</span>
                                <span className="text-muted-foreground">{bar.value}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted">
                                <div
                                  className={cn("h-1.5 rounded-full", bar.color)}
                                  style={{ width: `${bar.widthPercent}%` }}
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6 pt-4">
          {/* ── Moderation KPIs ── */}
          {moderationStats.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <KpiSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Pending Review"
                value={String(moderationStats.data?.pending_review ?? 0)}
                subtitle="Queue requiring moderator action"
                icon={Flag}
                variant="red"
              />
              <KpiCard
                title="Actioned Today"
                value={String(moderationStats.data?.actioned_today ?? 0)}
                subtitle="Posts reviewed since morning"
                icon={Gavel}
                variant="amber"
              />
              <KpiCard
                title="Approved This Week"
                value={String(moderationStats.data?.approved_this_week ?? 0)}
                subtitle="False positives or resolved safely"
                icon={Check}
                variant="green"
              />
              <KpiCard
                title="Users Warned"
                value={String(moderationStats.data?.users_warned ?? 0)}
                subtitle="Escalations issued"
                icon={Shield}
                variant="default"
              />
            </div>
          )}

          {/* ── Moderation Queue ── */}
          <Card className="rounded-3xl border border-border/80 py-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {moderationFilterChips.map((chip) => (
                    <Badge
                      key={chip.label}
                      variant={chip.active ? "default" : "outline"}
                      className={cn(
                        "h-8 cursor-pointer rounded-full px-3 text-xs",
                        chip.active
                          ? "bg-[#1b4332] text-white hover:bg-[#1b4332]"
                          : "border-border bg-white text-muted-foreground"
                      )}
                      onClick={() =>
                        setModerationFilter(chip.label === "All" ? undefined : chip.label)
                      }
                    >
                      {chip.label} ({chip.count})
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="h-8 w-full justify-between rounded-xl px-3 md:w-[140px]"
                >
                  Newest first
                  <ChevronDown className="size-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="mt-4 space-y-4">
                {moderationQueue.isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-48 w-full rounded-3xl" />
                    ))}
                  </div>
                ) : !moderationQueue.data?.items?.length ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No items in moderation queue
                  </p>
                ) : (
                  moderationQueue.data.items.map((item, index) => {
                    const reasonTone =
                      item.reason.toLowerCase() === "spam" ? "amber" : "red"
                    const borderColor =
                      reasonTone === "red" ? "border-red-200" : "border-amber-200"
                    const avatarColor =
                      reasonTone === "red"
                        ? "bg-red-50 text-red-500"
                        : "bg-amber-50 text-amber-600"
                    const quoteColor =
                      reasonTone === "red"
                        ? "bg-red-50/80 text-slate-700"
                        : "bg-amber-50/80 text-slate-700"

                    const actions: {
                      label: string
                      tone: "green" | "red" | "slate" | "purple"
                      icon: typeof Check
                      actionKey: "keep" | "remove" | "warn_user" | "ban_user" | "pin_correction"
                    }[] = [
                      { label: "Keep Post", tone: "green", icon: Check, actionKey: "keep" },
                      { label: "Remove Post", tone: "red", icon: X, actionKey: "remove" },
                      { label: "Warn User", tone: "slate", icon: AlertTriangle, actionKey: "warn_user" },
                      { label: "Ban User", tone: "purple", icon: Gavel, actionKey: "ban_user" },
                      ...(item.reason.toLowerCase() !== "spam"
                        ? [{ label: "Pin Correction", tone: "slate" as const, icon: Pin, actionKey: "pin_correction" as const }]
                        : []),
                    ]

                    return (
                      <Card
                        key={item.report_id}
                        className={cn(
                          "rounded-3xl border py-0 shadow-[0_8px_24px_rgba(15,23,42,0.06)]",
                          borderColor
                        )}
                      >
                        <CardContent className="p-5">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start">
                            <div
                              className={cn(
                                "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                                avatarColor
                              )}
                            >
                              {item.author_initials}
                            </div>
                            <div className="min-w-0 flex-1 space-y-3">
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-semibold text-foreground">
                                  {item.author_name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "rounded-full px-2 py-0.5",
                                    moderationBadgeStyles(reasonTone)
                                  )}
                                >
                                  {item.reason}
                                </Badge>
                                <span className="text-muted-foreground">
                                  Flagged by {item.report_count} users
                                </span>
                                <span className="text-muted-foreground">
                                  {timeAgo(item.earliest_report_at)}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  "rounded-2xl px-4 py-3 text-sm",
                                  quoteColor
                                )}
                              >
                                &ldquo;{item.body_excerpt}&rdquo;
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {item.context}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {actions.map((action) => {
                                  const Icon = action.icon

                                  return (
                                    <Button
                                      key={action.label}
                                      variant="outline"
                                      size="sm"
                                      className={cn(
                                        "rounded-lg border text-xs shadow-none",
                                        moderationActionStyles(action.tone)
                                      )}
                                      onClick={() =>
                                        moderationAction.mutate(
                                          {
                                            target_type: item.target_type,
                                            target_id: item.target_id,
                                            action: action.actionKey,
                                          },
                                          {
                                            onSuccess: () =>
                                              toast.success(`${action.label} action completed`),
                                            onError: () =>
                                              toast.error(`Failed to ${action.label.toLowerCase()}`),
                                          }
                                        )
                                      }
                                    >
                                      <Icon className="size-3" />
                                      {action.label}
                                    </Button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Load more ── */}
          <Card className="rounded-2xl border border-sky-100 py-0 shadow-sm">
            <CardContent className="flex items-center justify-between px-4 py-4">
              <p className="text-sm text-muted-foreground">
                {moderationQueue.data
                  ? `+ ${Math.max(0, (moderationQueue.data.total ?? 0) - (moderationQueue.data.items?.length ?? 0))} more flagged items sorted by report count`
                  : "Loading..."}
              </p>
              <Button variant="outline" className="rounded-xl px-4">
                Load More
              </Button>
            </CardContent>
          </Card>

          {/* ── Flagged Articles table ── */}
          <Card className="rounded-3xl border border-border/80 py-0 shadow-sm">
            <CardHeader className="border-b border-border/60 py-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Flagged Articles & Published Content</CardTitle>
                  <CardDescription>
                    Articles and educational content in the Content Library that
                    have been reported by users or auto-flagged for outdated or
                    inaccurate information.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-700"
                >
                  {flaggedContent.data?.total ?? 0} items need review
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {flaggedContent.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <LocalTable
                  data={moderationContentTableRows}
                  columns={moderationContentColumns}
                  searchParams={moderationContentSearchParams}
                  fallbackSortColumn="reports"
                  searchPlaceholder="Search flagged content..."
                  emptyTitle="No flagged content"
                  emptyDescription="Reviewed or auto-flagged content items will appear here."
                  showToolbar={false}
                />
              )}
            </CardContent>
          </Card>
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
      void setQueryState({
        pageIndex: 0,
        sort: getSortingValue(next, `${fallbackSortColumn}.desc`),
      })
    },
    onColumnFiltersChange: (updater) =>
      setColumnFilters((current) => resolveUpdater(updater, current)),
    onColumnVisibilityChange: (updater) =>
      setColumnVisibility((current) => resolveUpdater(updater, current)),
    onRowSelectionChange: (updater) =>
      setRowSelection((current) => resolveUpdater(updater, current)),
    onGlobalFilterChange: (value) => {
      void setQueryState({
        globalFilter: resolveUpdater(value, queryState.globalFilter),
        pageIndex: 0,
      })
    },
  })

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-xs shadow-black/5">
      {showToolbar ? (
        <DataTableToolbar table={table} searchPlaceholder={searchPlaceholder} />
      ) : null}
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
