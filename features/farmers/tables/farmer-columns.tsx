"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import type { FarmerRow } from "@/features/farmers/types"

export const farmerColumns: ColumnDef<FarmerRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/farmers/${row.original.id}`} className="block space-y-0.5 hover:underline">
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </Link>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "region",
    header: "Region",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.region}</span>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.plan}</Badge>
    ),
  },
  {
    accessorKey: "species",
    header: "Species",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.species}</span>
    ),
  },
  {
    accessorKey: "pondCount",
    header: "Ponds",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.pondCount}</span>
    ),
  },
  {
    accessorKey: "avgPondScore",
    header: "Avg Pondscore",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.avgPondScore}</span>
    ),
  },
  {
    accessorKey: "alertCount",
    header: "Alerts",
    cell: ({ row }) => {
      const count = row.original.alertCount
      if (count === 0) return <span className="text-muted-foreground">0</span>
      return (
        <span className="inline-flex items-center gap-1 text-amber-600">
          <AlertTriangle className="h-3 w-3" />
          {count}
        </span>
      )
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">{row.original.lastLogin}</span>
    ),
  },
  {
    accessorKey: "accountStatus",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.original.accountStatus)}>
        {row.original.accountStatus}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Action",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DataTableRowActions
          actions={[
            {
              label: "View profile",
              href: `/farmers/${row.original.id}`,
            },
          ]}
        />
      </div>
    ),
  },
]

function getStatusVariant(status: string) {
  switch (status) {
    case "active":
      return "default" as const
    case "suspended":
      return "destructive" as const
    case "archived":
      return "outline" as const
    default:
      return "secondary" as const
  }
}
