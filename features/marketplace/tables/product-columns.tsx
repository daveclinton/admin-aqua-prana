"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ProductRow } from "@/features/marketplace/types"

const categoryColors: Record<string, string> = {
  feed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  aeration: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  chemical: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  equipment: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400",
  testing: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
}

function getCategoryColor(cat: string) {
  const lower = cat.toLowerCase()
  for (const [key, cls] of Object.entries(categoryColors)) {
    if (lower.includes(key)) return cls
  }
  return "bg-muted text-muted-foreground"
}

export const productColumns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.id.slice(0, 6)}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const cat = row.original.category
      if (cat === "-") return <span className="text-muted-foreground">-</span>
      return (
        <span className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(cat)}`}>
          {cat}
        </span>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price (₹)",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.price.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "orderCount",
    header: "Orders",
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">{row.original.orderCount}</span>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.stock}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const stock = row.original.stock
      if (status === "active" && stock <= 20) {
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Low Stock</Badge>
      }
      return (
        <Badge variant={getProductStatusVariant(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Action",
    enableSorting: false,
    enableHiding: false,
    cell: () => (
      <Button variant="outline" size="sm">
        Edit
      </Button>
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
