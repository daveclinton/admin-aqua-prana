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

const trendingTopics = [
  {
    title: "Best practices for white spot",
    time: "2 days ago",
    meta: "1.2k views · 30 replies",
    state: "Trending",
  },
  {
    title: "Probiotic recommendations",
    time: "1 day ago",
    meta: "1.0k views · 20 replies",
    state: "Trending",
  },
  {
    title: "DO management during monsoon season",
    time: "4 hours ago",
    meta: "880 views · 14 replies",
    state: "Rising",
  },
] as const

const experts = [
  {
    name: "Dr. Kumar",
    specialty: "Water Quality",
    rating: "4.9",
    status: "Verified",
    pending: false,
  },
  {
    name: "Anand Pn",
    specialty: "Feed management",
    rating: "Pending review",
    status: "Needs Review",
    pending: true,
  },
  {
    name: "Dr. Meera Singh",
    specialty: "Disease mitigation",
    rating: "4.8",
    status: "Verified",
    pending: false,
  },
] as const

const discussionContentRows = [
  {
    title: "Feeding Best Practices for Shrimp",
    type: "Article",
    category: "Feeding",
    author: "Dr. Kumar",
    views: "12,400",
    readRate: "82%",
    published: "Jan 18",
    status: "Published",
    actions: ["Edit", "Archive"],
  },
  {
    title: "Disease Management - Video Series",
    type: "Video",
    category: "Disease",
    author: "Admin",
    views: "8,200",
    readRate: "68%",
    published: "Dec 22",
    status: "Published",
    actions: ["Edit", "Archive"],
  },
  {
    title: "DO Management & Aerator Guide",
    type: "Article",
    category: "Water Quality",
    author: "Admin",
    views: "—",
    readRate: "—",
    published: "Not published",
    status: "Draft",
    actions: ["Edit & Publish"],
  },
  {
    title: "Optimal Pond Preparation Guide",
    type: "Article",
    category: "Pond Prep",
    author: "Dr. Kumar",
    views: "9,800",
    readRate: "74%",
    published: "Nov 16",
    status: "Published",
    actions: ["Edit", "Archive"],
  },
  {
    title: "White Spot Disease Prevention",
    type: "Article",
    category: "Disease",
    author: "Admin",
    views: "—",
    readRate: "—",
    published: "Not published",
    status: "Draft",
    actions: ["Edit & Publish"],
  },
  {
    title: "Ammonia Control in High-Density Ponds",
    type: "Article",
    category: "Water Quality",
    author: "Dr. Meera",
    views: "6,100",
    readRate: "59%",
    published: "Oct 5",
    status: "Published",
    actions: ["Edit", "Archive"],
  },
] as const

const contentCategories = [
  { category: "Water Quality", articles: "8", videos: "2", views: "12k" },
  { category: "Disease Management", articles: "6", videos: "3", views: "18k" },
  { category: "Feeding", articles: "4", videos: "2", views: "12k" },
  { category: "Pond Preparation", articles: "6", videos: "1", views: "9k" },
] as const

const contentPerformance = [
  { label: "Avg completion rate", value: "74%" },
  { label: "Top performing", value: "Feeding Best Practices" },
  { label: "Most shared", value: "Disease Management Video" },
  { label: "Needs update (30 days)", value: "3 articles" },
  { label: "Awaiting approval", value: "2 drafts" },
] as const

const categoryViewBars = [
  { label: "Water Quality", value: "22k", width: "w-[86%]", color: "bg-blue-500" },
  { label: "Disease Mgmt", value: "18k", width: "w-[72%]", color: "bg-red-500" },
  { label: "Feeding", value: "12k", width: "w-[52%]", color: "bg-emerald-500" },
] as const

const moderationFilterChips = [
  { label: "All", count: 24, active: true },
  { label: "Spam", count: 8, active: false },
  { label: "Misinformation", count: 9, active: false },
  { label: "Offensive", count: 7, active: false },
] as const

const moderationQueue = [
  {
    id: "mq-1",
    initials: "AB",
    user: "AnonUser123",
    reason: "Misinformation",
    reports: "Flagged by 12 users",
    time: "2 hours ago",
    quote:
      '"Adding bleach to your pond will kill all bacteria and improve DO levels instantly. This worked for me on 3 ponds."',
    context:
      'Flagged in: "Water Quality Tips" thread · Post ID: #P-3041 · Thread: Best practices for improving DO',
    actions: [
      { label: "Keep Post", tone: "green", icon: Check },
      { label: "Remove Post", tone: "red", icon: X },
      { label: "Warn User", tone: "slate", icon: AlertTriangle },
      { label: "Ban User", tone: "purple", icon: Gavel },
      { label: "Pin Correction", tone: "slate", icon: Pin },
    ],
  },
  {
    id: "mq-2",
    initials: "S2",
    user: "Seller2Promo",
    reason: "Spam",
    reports: "Flagged by 5 users",
    time: "4 hours ago",
    quote:
      '"Buy our miracle feed supplement and double your yield in 2 weeks! Click here: [external link] — limited time offer only £299"',
    context:
      'Flagged in: "Product Recommendations" thread · Post ID: #P-3055 · User history: 3 prior spam warnings',
    actions: [
      { label: "Keep Post", tone: "green", icon: Check },
      { label: "Remove Post", tone: "red", icon: X },
      { label: "Warn User", tone: "slate", icon: AlertTriangle },
      { label: "Ban User", tone: "purple", icon: Gavel },
    ],
  },
] as const

const moderationContentRows = [
  {
    title: "Adding bleach improves DO — comment thread link",
    type: "Forum Post",
    reason: "Misinformation",
    flaggedBy: "12 users",
    reports: "12",
    published: "Active",
    status: "Urgent",
    actions: [
      { label: "Remove", tone: "red" },
      { label: "Review", tone: "slate" },
    ],
  },
  {
    title: "Pond Preparation Guide (2023)",
    type: "Article",
    reason: "Outdated Info",
    flaggedBy: "3 users",
    reports: "3",
    published: "Nov 2023",
    status: "Needs Update",
    actions: [
      { label: "Edit Article", tone: "green" },
      { label: "Dismiss", tone: "slate" },
    ],
  },
  {
    title: "Ammonia treatment with raw chemicals",
    type: "Article",
    reason: "Safety Risk",
    flaggedBy: "Auto-flagged",
    reports: "—",
    published: "Dec 2024",
    status: "Under Review",
    actions: [
      { label: "Unpublish", tone: "red" },
      { label: "Edit", tone: "slate" },
    ],
  },
  {
    title: "Feed rate table — incorrect FCR values",
    type: "Article",
    reason: "Factual Error",
    flaggedBy: "2 users",
    reports: "2",
    published: "Jan 2025",
    status: "Needs Update",
    actions: [
      { label: "Edit Article", tone: "green" },
      { label: "Dismiss", tone: "slate" },
    ],
  },
] as const

type DiscussionContentRow = (typeof discussionContentRows)[number] & { id: string }
type ModerationContentRow = (typeof moderationContentRows)[number] & { id: string }

const discussionContentTableRows: DiscussionContentRow[] = discussionContentRows.map((row, index) => ({
  id: `content-${index + 1}`,
  ...row,
}))

const moderationContentTableRows: ModerationContentRow[] = moderationContentRows.map((row, index) => ({
  id: `review-${index + 1}`,
  ...row,
}))

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

const discussionContentColumns: ColumnDef<DiscussionContentRow>[] = [
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
    cell: ({ row }) => (
      <span
        className={cn(
          row.original.readRate === "82%" || row.original.readRate === "74%"
            ? "text-emerald-600"
            : row.original.readRate === "59%"
              ? "text-amber-600"
              : "text-muted-foreground"
        )}
      >
        {row.original.readRate}
      </span>
    ),
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
          >
            {action}
          </Button>
        ))}
      </div>
    ),
  },
]

const moderationContentColumns: ColumnDef<ModerationContentRow>[] = [
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
          >
            {action.label}
          </Button>
        ))}
      </div>
    ),
  },
]

export function CommunityForumClient() {
  const [workspace, setWorkspace] = useQueryState(
    "workspace",
    parseAsStringLiteral(workspaceTabs).withDefault("discussions")
  )

  const currentWorkspace = workspace ?? "discussions"

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
            Moderation (24)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="space-y-6 pt-4">
          <div className="flex justify-end">
            <Button className="rounded-full bg-[#1b4332] px-3 text-white hover:bg-[#244d39]">
              <Megaphone className="size-3.5" />
              Pin Announcement
            </Button>
          </div>

          <div className="grid gap-4 xl:grid-cols-4">
            <KpiCard title="Active Discussions" value="800" icon={MessageCircle} variant="default" />
            <KpiCard title="Total Posts" value="12,000" icon={MessageCircle} variant="default" />
            <KpiCard title="Active Members" value="8,000" icon={Users} variant="default" />
            <KpiCard title="Flagged Content" value="24" icon={Flag} variant="red" />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl border border-border/80 py-0">
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={topic.title}
                    className="flex items-start justify-between gap-4 border-t border-border/60 py-3 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-emerald-50 text-[0.625rem] font-semibold text-emerald-700">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{topic.title}</p>
                        <p className="text-xs text-muted-foreground">{topic.time}</p>
                        <p className="text-xs text-muted-foreground">{topic.meta}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full",
                        topic.state === "Trending"
                          ? "border-orange-200 bg-orange-50 text-orange-600"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      )}
                    >
                      {topic.state}
                    </Badge>
                  </div>
                ))}
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
                {experts.map((expert, index) => (
                  <div
                    key={expert.name}
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
                          {!expert.pending ? (
                            <span className="text-xs text-amber-500">★★★★★</span>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {expert.specialty}
                        </p>
                        <p className="text-xs text-muted-foreground">{expert.rating}</p>
                      </div>
                    </div>
                    {expert.pending ? (
                      <div className="flex gap-2">
                        <Button className="h-6 rounded-full bg-[#1b4332] px-2.5 text-[0.625rem] text-white hover:bg-[#244d39]">
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          className="h-6 rounded-full border-red-200 bg-red-50 px-2.5 text-[0.625rem] text-red-600"
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
                ))}
              </CardContent>
            </Card>
          </div>

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
              <Button className="rounded-full bg-[#1b4332] px-3 text-white hover:bg-[#244d39]">
                + New Content
              </Button>
            </div>

            <div className="grid gap-3 xl:grid-cols-5">
              <KpiCard title="Total Articles" value="24" icon={MessageCircle} variant="default" />
              <KpiCard title="Videos" value="8" icon={Video} variant="default" />
              <KpiCard title="Drafts" value="3" icon={Clock3} variant="amber" />
              <KpiCard title="Total Views" value="45.2K" icon={Users} variant="green" />
              <KpiCard title="Avg Read Rate" value="74%" icon={Check} variant="teal" />
            </div>

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
                <LocalTable
                  data={discussionContentTableRows}
                  columns={discussionContentColumns}
                  searchParams={discussionContentSearchParams}
                  fallbackSortColumn="published"
                  searchPlaceholder="Search content..."
                  emptyTitle="No content found"
                  emptyDescription="Published articles, videos, and drafts will appear here."
                  showToolbar={false}
                  footerNote="Showing 6 of 32 items"
                />
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="rounded-2xl border border-border/80 py-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Content Categories</CardTitle>
                    <Button variant="outline" className="h-8 rounded-full px-3">
                      + Add Category
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
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
                      {contentCategories.map((row) => (
                        <TableRow key={row.category}>
                          <TableCell className="px-4 font-medium">
                            {row.category}
                          </TableCell>
                          <TableCell>{row.articles}</TableCell>
                          <TableCell>{row.videos}</TableCell>
                          <TableCell>{row.views}</TableCell>
                          <TableCell className="px-4">
                            <Button variant="outline" size="sm" className="rounded-full">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-border/80 py-0">
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {contentPerformance.map((item) => (
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
                    {categoryViewBars.map((bar) => (
                      <div key={bar.label} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{bar.label}</span>
                          <span className="text-muted-foreground">{bar.value}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted">
                          <div
                            className={cn("h-1.5 rounded-full", bar.width, bar.color)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Pending Review"
              value="24"
              subtitle="Queue requiring moderator action"
              icon={Flag}
              variant="red"
            />
            <KpiCard
              title="Actioned Today"
              value="8"
              subtitle="Posts reviewed since morning"
              icon={Gavel}
              variant="amber"
            />
            <KpiCard
              title="Approved This Week"
              value="16"
              subtitle="False positives or resolved safely"
              icon={Check}
              variant="green"
            />
            <KpiCard
              title="Users Warned"
              value="4"
              subtitle="Escalations issued"
              icon={Shield}
              variant="default"
            />
          </div>

          <Card className="rounded-3xl border border-border/80 py-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {moderationFilterChips.map((chip) => (
                    <Badge
                      key={chip.label}
                      variant={chip.active ? "default" : "outline"}
                      className={cn(
                        "h-8 rounded-full px-3 text-xs",
                        chip.active
                          ? "bg-[#1b4332] text-white hover:bg-[#1b4332]"
                          : "border-border bg-white text-muted-foreground"
                      )}
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
                {moderationQueue.map((item, index) => (
                  <Card
                    key={item.id}
                    className={cn(
                      "rounded-3xl border py-0 shadow-[0_8px_24px_rgba(15,23,42,0.06)]",
                      index === 0 ? "border-red-200" : "border-amber-200"
                    )}
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start">
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                            index === 0
                              ? "bg-red-50 text-red-500"
                              : "bg-amber-50 text-amber-600"
                          )}
                        >
                          {item.initials}
                        </div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-foreground">
                              {item.user}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full px-2 py-0.5",
                                moderationBadgeStyles(
                                  item.reason === "Spam" ? "amber" : "red"
                                )
                              )}
                            >
                              {item.reason}
                            </Badge>
                            <span className="text-muted-foreground">
                              {item.reports}
                            </span>
                            <span className="text-muted-foreground">{item.time}</span>
                          </div>
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-3 text-sm",
                              index === 0
                                ? "bg-red-50/80 text-slate-700"
                                : "bg-amber-50/80 text-slate-700"
                            )}
                          >
                            {item.quote}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {item.context}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.actions.map((action) => {
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
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-sky-100 py-0 shadow-sm">
            <CardContent className="flex items-center justify-between px-4 py-4">
              <p className="text-sm text-muted-foreground">
                + 22 more flagged items sorted by report count
              </p>
              <Button variant="outline" className="rounded-xl px-4">
                Load More
              </Button>
            </CardContent>
          </Card>

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
                  6 items need review
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
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
