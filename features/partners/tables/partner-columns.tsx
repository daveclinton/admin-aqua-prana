"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { formatTableDate } from "@/lib/table/table-utils"
import type { PartnerRow } from "@/features/partners/types"

export const partnerColumns: ColumnDef<PartnerRow>[] = [
  {
    accessorKey: "name",
    header: "Partner",
    cell: ({ row }) => (
      <Link
        href={`/partners/${row.original.id}`}
        className="block space-y-0.5 hover:underline"
      >
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </Link>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "organization",
    header: "Organization",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.phone}</span>
    ),
  },
  {
    accessorKey: "partnerStatus",
    header: "Partner status",
    cell: ({ row }) => (
      <Badge variant={getPartnerStatusVariant(row.original.partnerStatus)}>
        {row.original.partnerStatus.replace("_", " ")}
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
              href: `/partners/${row.original.id}`,
            },
          ]}
        />
      </div>
    ),
  },
]

function getPartnerStatusVariant(status: string) {
  switch (status) {
    case "active":
      return "default" as const
    case "pending_activation":
      return "outline" as const
    case "suspended":
      return "destructive" as const
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
