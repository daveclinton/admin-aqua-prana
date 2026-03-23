"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Star, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ChatRow } from "@/features/aquagpt/types"

function timeAgo(dateStr: string) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.max(0, now - then)
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? "s" : ""} ago`
}

const topicColors: Record<string, string> = {
  Pond: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  Fungus: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  Feeding: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Disease: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  Water: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400",
  Harvest: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
}

function getTopicColor(topic: string) {
  for (const [key, cls] of Object.entries(topicColors)) {
    if (topic.toLowerCase().includes(key.toLowerCase())) return cls
  }
  return "bg-muted text-muted-foreground"
}

export const chatColumns: ColumnDef<ChatRow>[] = [
  {
    accessorKey: "userId",
    header: "User ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.userId.slice(0, 6)}
      </span>
    ),
  },
  {
    accessorKey: "chatId",
    header: "Chat ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.chatId.slice(0, 6)}
      </span>
    ),
  },
  {
    accessorKey: "topic",
    header: "Topic",
    cell: ({ row }) => {
      const topic = row.original.topic
      if (topic === "-") return <span className="text-muted-foreground">-</span>
      return (
        <span className={cn("inline-block rounded-md px-2.5 py-0.5 text-xs font-medium", getTopicColor(topic))}>
          {topic}
        </span>
      )
    },
  },
  {
    accessorKey: "messages",
    header: "Messages",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.messages}</span>
    ),
  },
  {
    accessorKey: "lastActive",
    header: "Last Active",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {timeAgo(row.original.lastActive)}
      </span>
    ),
  },
  {
    accessorKey: "accuracy",
    header: "Accuracy",
    cell: ({ row }) => {
      const acc = row.original.accuracy
      if (acc == null) return <span className="text-muted-foreground">-</span>
      const color =
        acc >= 90
          ? "bg-emerald-500"
          : acc >= 70
            ? "bg-amber-500"
            : "bg-red-500"
      return (
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", color)}
              style={{ width: `${acc}%` }}
            />
          </div>
          <span className="text-xs font-medium">{acc}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.original.rating
      if (rating == null) return <span className="text-muted-foreground">-</span>
      const fullStars = Math.floor(rating)
      const halfStar = rating % 1 >= 0.5
      return (
        <div className="flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < fullStars
                    ? "fill-amber-400 text-amber-400"
                    : i === fullStars && halfStar
                      ? "fill-amber-400/50 text-amber-400"
                      : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <span className="text-xs font-medium">{rating.toFixed(1)}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "escalated",
    header: "Escalated",
    cell: ({ row }) => {
      if (!row.original.escalated) return <span className="text-muted-foreground">—</span>
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Yes
        </Badge>
      )
    },
  },
]
