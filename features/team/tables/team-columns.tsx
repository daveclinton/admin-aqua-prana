"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { formatTableDate } from "@/lib/table/table-utils"
import type { TeamMemberRow } from "@/features/team/types"

export const teamColumns: ColumnDef<TeamMemberRow>[] = [
  {
    accessorKey: "name",
    header: "Team member",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "ticketsAssigned",
    header: "Open tickets",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.ticketsAssigned}</span>
    ),
  },
  {
    accessorKey: "lastActiveAt",
    header: "Last active",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatTableDate(row.original.lastActiveAt)}
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
              label: "Resend invite",
              onClick: () =>
                toast.success(`Invite resent to ${row.original.email}`),
            },
            {
              label: "Suspend access",
              variant: "destructive",
              onClick: () =>
                toast.error(`Suspended ${row.original.name} from admin access`),
            },
          ]}
        />
      </div>
    ),
  },
]

function getStatusVariant(status: TeamMemberRow["status"]) {
  switch (status) {
    case "active":
      return "default"
    case "pending":
      return "outline"
    case "invited":
      return "secondary"
    default:
      return "outline"
  }
}
