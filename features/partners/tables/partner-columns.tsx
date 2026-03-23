"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { MapPin, Mail, Phone, Megaphone, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTableRowActions } from "@/components/table/data-table-row-actions"
import { formatTableDate } from "@/lib/table/table-utils"
import type { PartnerRow } from "@/features/partners/types"

export const partnerColumns: ColumnDef<PartnerRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
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
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.category}</Badge>
    ),
  },
  {
    accessorKey: "partnerStatus",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getPartnerStatusVariant(row.original.partnerStatus)}>
        {row.original.partnerStatus.replace("_", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        {row.original.location !== "-" && <MapPin className="h-3 w-3" />}
        {row.original.location}
      </span>
    ),
  },
  {
    accessorKey: "campaignCount",
    header: "Campaigns",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1 font-medium">
        <Megaphone className="h-3 w-3 text-muted-foreground" />
        {row.original.campaignCount}
      </span>
    ),
  },
  {
    accessorKey: "connectedFarmers",
    header: "Connected Farmers",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1 font-medium">
        <Users className="h-3 w-3 text-muted-foreground" />
        {row.original.connectedFarmers.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {formatTableDate(row.original.createdAt)}
      </span>
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
              href: `/partners/${row.original.id}`,
            },
          ]}
        />
      </div>
    ),
  },
  {
    id: "contact",
    header: "Contact",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-muted-foreground">
        {row.original.phone !== "-" && (
          <a href={`tel:${row.original.phone}`} title={row.original.phone}>
            <Phone className="h-3.5 w-3.5 hover:text-foreground transition-colors" />
          </a>
        )}
        <a href={`mailto:${row.original.email}`} title={row.original.email}>
          <Mail className="h-3.5 w-3.5 hover:text-foreground transition-colors" />
        </a>
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
