"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { formatTableDate } from "@/lib/table/table-utils"
import type { FarmerRow } from "@/features/farmers/types"

export const farmerColumns: ColumnDef<FarmerRow>[] = [
  {
    accessorKey: "name",
    header: "Farmer",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.phone}</span>
    ),
  },
  {
    accessorKey: "accountStatus",
    header: "Account",
    cell: ({ row }) => (
      <Badge variant={getAccountVariant(row.original.accountStatus)}>
        {row.original.accountStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "verificationStatus",
    header: "Verification",
    cell: ({ row }) => (
      <Badge variant={getVerificationVariant(row.original.verificationStatus)}>
        {row.original.verificationStatus.replace("_", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
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
              label: "View profile",
              onClick: () =>
                toast.info(`Open profile for ${row.original.name}`),
            },
            {
              label: "Suspend account",
              variant: "destructive",
              onClick: () =>
                toast.error(`Suspended ${row.original.name}`),
            },
          ]}
        />
      </div>
    ),
  },
]

function getAccountVariant(status: string) {
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

function getVerificationVariant(status: string) {
  switch (status) {
    case "verified":
      return "default" as const
    case "pending_review":
      return "outline" as const
    case "rejected":
      return "destructive" as const
    case "unverified":
      return "secondary" as const
    default:
      return "secondary" as const
  }
}
