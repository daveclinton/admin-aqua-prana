"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { formatTableDate } from "@/lib/table/table-utils"
import type { ProductRow } from "@/features/marketplace/types"

export const productColumns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.category}</p>
      </div>
    ),
    enableHiding: false,
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
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="text-foreground">
        {row.original.currency} {row.original.price.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.stock}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getProductStatusVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Listed",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatTableDate(row.original.createdAt)}
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
              label: "View product",
              onClick: () =>
                toast.info(`Open product: ${row.original.name}`),
            },
            {
              label: "Flag product",
              variant: "destructive",
              onClick: () =>
                toast.error(`Flagged ${row.original.name}`),
            },
          ]}
        />
      </div>
    ),
  },
]

function getProductStatusVariant(status: string) {
  switch (status) {
    case "active":
      return "default" as const
    case "draft":
      return "outline" as const
    case "flagged":
      return "destructive" as const
    case "removed":
      return "secondary" as const
    default:
      return "secondary" as const
  }
}
