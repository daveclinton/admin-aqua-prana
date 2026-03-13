"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { formatTableDate } from "@/lib/table/table-utils"
import type { PassbookEntryRow } from "@/features/passbook/types"

export const passbookColumns: ColumnDef<PassbookEntryRow>[] = [
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[300px] space-y-0.5">
        <p className="truncate font-medium text-foreground">
          {row.original.description}
        </p>
        <p className="text-xs text-muted-foreground">{row.original.pond}</p>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "userName",
    header: "Farmer",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="text-foreground">{row.original.userName}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.userEmail}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={getEntryTypeVariant(row.original.type)}>
        {row.original.type.replace("_", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      if (row.original.amount == null) {
        return <span className="text-muted-foreground">-</span>
      }
      return (
        <span
          className={
            row.original.isCredit
              ? "font-medium text-emerald-600"
              : "font-medium text-foreground"
          }
        >
          {row.original.isCredit ? "+" : ""}
          {row.original.amount.toLocaleString()}
        </span>
      )
    },
  },
  {
    accessorKey: "entryDate",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatTableDate(row.original.entryDate)}
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
              label: "View entry",
              onClick: () =>
                toast.info(`Open entry: ${row.original.description}`),
            },
          ]}
        />
      </div>
    ),
  },
]

function getEntryTypeVariant(type: string) {
  switch (type) {
    case "revenue":
    case "harvest":
      return "default" as const
    case "expense":
    case "chemical":
    case "feed":
    case "equipment":
      return "outline" as const
    case "mortality":
      return "destructive" as const
    case "water_quality":
    case "water_exchange":
      return "secondary" as const
    default:
      return "secondary" as const
  }
}
