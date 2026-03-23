"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatTableDate } from "@/lib/table/table-utils"
import type { OrderRow } from "@/features/marketplace/types"

export const orderColumns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "id",
    header: "Order #",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">
        #{row.original.id.slice(0, 6)}
      </span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <span className="text-foreground">{row.original.details}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">
        ₹{row.original.amount.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatTableDate(row.original.date)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getOrderStatusVariant(row.original.status)}>
        {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
      </Badge>
    ),
  },
  {
    accessorKey: "seller",
    header: "Seller",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.seller}</span>
    ),
  },
  {
    id: "actions",
    header: "Action",
    enableSorting: false,
    enableHiding: false,
    cell: () => (
      <Button variant="outline" size="sm">
        View
      </Button>
    ),
  },
]

function getOrderStatusVariant(status: string) {
  switch (status) {
    case "shipped":
      return "default" as const
    case "completed":
    case "delivered":
      return "default" as const
    case "pending":
    case "confirmed":
      return "outline" as const
    case "cancelled":
      return "destructive" as const
    case "refunding":
    case "refunded":
      return "destructive" as const
    default:
      return "secondary" as const
  }
}
