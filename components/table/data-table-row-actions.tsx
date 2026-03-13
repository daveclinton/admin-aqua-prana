"use client"

import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export type DataTableRowAction = {
  label: string
  onClick: () => void
  variant?: "default" | "destructive"
}

type DataTableRowActionsProps = {
  actions: DataTableRowAction[]
}

export function DataTableRowActions({
  actions,
}: DataTableRowActionsProps) {
  if (!actions.length) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label="Open row actions"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {actions.map((action, index) => (
          <div key={action.label}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              variant={action.variant}
              onClick={action.onClick}
            >
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
