"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { formatTableDate } from "@/lib/table/table-utils"
import type { OrderRow } from "@/features/marketplace/types"

export const orderColumns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-foreground">
        {row.original.id.slice(0, 8)}…
      </span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "buyerName",
    header: "Buyer",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="text-foreground">{row.original.buyerName}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.buyerEmail}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "sellerName",
    header: "Seller",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="text-foreground">{row.original.sellerName}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.sellerEmail}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {row.original.currency} {row.original.total.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getOrderStatusVariant(row.original.status)}>
        {row.original.status.replace("_", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "placedAt",
    header: "Placed",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatTableDate(row.original.placedAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DataTableRowActions
          actions={[
            {
              label: "View order",
              onClick: () =>
                toast.info(`Open order ${row.original.id.slice(0, 8)}`),
            },
          ]}
        />
      </div>
    ),
  },
]

function getOrderStatusVariant(status: string) {
  switch (status) {
    case "completed":
    case "delivered":
      return "default" as const
    case "pending":
    case "processing":
      return "outline" as const
    case "cancelled":
    case "refunded":
      return "destructive" as const
    default:
      return "secondary" as const
  }
}
