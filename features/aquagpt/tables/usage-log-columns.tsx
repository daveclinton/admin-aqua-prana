"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { formatTableDate } from "@/lib/table/table-utils"
import type { UsageLogRow } from "@/features/aquagpt/types"

export const usageLogColumns: ColumnDef<UsageLogRow>[] = [
  {
    accessorKey: "userName",
    header: "User",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="font-medium text-foreground">{row.original.userName}</p>
        <p className="text-xs text-muted-foreground">{row.original.userEmail}</p>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "userMessage",
    header: "Message",
    cell: ({ row }) => (
      <p className="max-w-[300px] truncate text-foreground">
        {row.original.userMessage}
      </p>
    ),
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.model}
      </span>
    ),
  },
  {
    accessorKey: "totalTokens",
    header: "Tokens",
    cell: ({ row }) =>
      row.original.totalTokens != null ? (
        <span className="tabular-nums text-foreground">
          {row.original.totalTokens.toLocaleString()}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    accessorKey: "latencyMs",
    header: "Latency",
    cell: ({ row }) =>
      row.original.latencyMs != null ? (
        <span className="tabular-nums text-muted-foreground">
          {row.original.latencyMs.toLocaleString()}ms
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "success" ? "default" : "destructive"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatTableDate(row.original.createdAt)}
      </span>
    ),
  },
]
