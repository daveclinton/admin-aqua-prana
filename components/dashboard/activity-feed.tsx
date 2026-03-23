"use client"

import { useState } from "react"
import {
  UserPlus,
  ShoppingCart,
  AlertTriangle,
  FileText,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useOverviewActivity } from "@/features/overview/hooks"
import type { ActivityItem } from "@/features/overview/types"

// Map UI filter labels to API action filter strings
const FILTERS = [
  { label: "All", value: undefined },
  { label: "Signup", value: "auth" },
  { label: "Tickets", value: "ticket" },
  { label: "Alerts", value: "alert" },
] as const
type FilterLabel = (typeof FILTERS)[number]["label"]

function timeAgo(dateStr: string) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.max(0, now - then)
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

type ActivityCategory = "signup" | "purchase" | "alert" | "ticket"

function categorize(action: string): ActivityCategory {
  const a = action.toLowerCase()
  if (a.includes("auth.login") || a.includes("auth.register") || a.includes("signup") || a.includes("user.create") || a.includes("farmer.create"))
    return "signup"
  if (a.includes("product") || a.includes("order") || a.includes("purchase") || a.includes("partner") || a.includes("marketplace") || a.includes("payment"))
    return "purchase"
  if (a.includes("alert") || a.includes("verification") || a.includes("notification") || a.includes("sensor") || a.includes("warning"))
    return "alert"
  return "ticket"
}

const categoryConfig: Record<
  ActivityCategory,
  {
    label: string
    icon: typeof UserPlus
    iconBg: string
    iconColor: string
    badgeBg: string
    badgeText: string
  }
> = {
  signup: {
    label: "Signup",
    icon: UserPlus,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
  },
  purchase: {
    label: "Purchase",
    icon: ShoppingCart,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
  },
  alert: {
    label: "Alert",
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    badgeBg: "bg-red-50",
    badgeText: "text-red-600",
  },
  ticket: {
    label: "Ticket",
    icon: FileText,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
  },
}

function formatTitle(item: ActivityItem) {
  const action = item.action
    .replace(/\./g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
  const who = item.user_name || item.email || ""
  return who ? `${action} — ${who}` : action
}

function formatMeta(item: ActivityItem) {
  const parts: string[] = [timeAgo(item.created_at)]
  const meta = item.metadata as Record<string, unknown>

  if (meta?.location) parts.push(String(meta.location))
  if (item.ip_address) parts.push(`IP: ${item.ip_address}`)
  if (meta?.amount) parts.push(`₹${Number(meta.amount).toLocaleString()}`)
  if (meta?.seller) parts.push(`Seller: ${meta.seller}`)
  if (meta?.severity) parts.push(`Severity: ${String(meta.severity)}`)
  if (meta?.priority) parts.push(`Priority: ${String(meta.priority)}`)
  if (meta?.assigned) parts.push(`Assigned: ${String(meta.assigned)}`)

  return parts.join(" · ")
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  })
}

export function ActivityFeed() {
  const [activeFilter, setActiveFilter] = useState<FilterLabel>("All")
  const [selectedItem, setSelectedItem] = useState<ActivityItem | null>(null)

  const apiFilter = FILTERS.find((f) => f.label === activeFilter)?.value
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useOverviewActivity(apiFilter)

  const items = data?.pages.flatMap((page) => page.activity) ?? []

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-bold">Recent Activity</CardTitle>
          <div className="flex items-center gap-1">
            {FILTERS.map(({ label }) => (
              <button
                key={label}
                onClick={() => setActiveFilter(label)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activeFilter === label
                    ? "bg-emerald-900 text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No recent activity
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {items.map((item) => {
                const category = categorize(item.action)
                const config = categoryConfig[category]
                const Icon = config.icon

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="flex cursor-pointer items-center gap-4 py-4 transition-colors hover:bg-muted/30 first:pt-0 last:pb-0"
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        config.iconBg
                      )}
                    >
                      <Icon className={cn("h-5 w-5", config.iconColor)} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {formatTitle(item)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatMeta(item)}
                      </p>
                    </div>

                    {/* Badge + chevron */}
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={cn(
                          "rounded-md px-3 py-1 text-xs font-medium",
                          config.badgeBg,
                          config.badgeText
                        )}
                      >
                        {config.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Load more */}
          {hasNextPage && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity detail sheet */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent side="right" className="sm:max-w-md">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle>Event Detail</SheetTitle>
                <SheetDescription>
                  {formatTitle(selectedItem)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 p-6 pt-2">
                {/* Status */}
                <div className="flex items-center gap-2">
                  {selectedItem.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <Badge variant={selectedItem.success ? "secondary" : "destructive"}>
                    {selectedItem.success ? "Success" : "Failed"}
                  </Badge>
                </div>

                {/* Details grid */}
                <div className="space-y-3 text-sm">
                  <DetailRow label="Action" value={selectedItem.action} />
                  <DetailRow label="Time" value={formatFullDate(selectedItem.created_at)} />
                  {selectedItem.user_name && (
                    <DetailRow label="User" value={selectedItem.user_name} />
                  )}
                  {selectedItem.email && (
                    <DetailRow label="Email" value={selectedItem.email} />
                  )}
                  {selectedItem.ip_address && (
                    <DetailRow label="IP Address" value={selectedItem.ip_address} />
                  )}
                </div>

                {/* Metadata */}
                {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Metadata
                    </p>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                        {JSON.stringify(selectedItem.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-medium">{value}</span>
    </div>
  )
}
