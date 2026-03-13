"use client"

import {
  flexRender,
  type RowData,
  type Table as TanStackTable,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { DataTableEmpty } from "@/components/table/data-table-empty"
import { DataTableError } from "@/components/table/data-table-error"
import { DataTableLoading } from "@/components/table/data-table-loading"
import { DataTablePagination } from "@/components/table/data-table-pagination"

type DataTableProps<TData extends RowData> = {
  table: TanStackTable<TData>
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<TData extends RowData>({
  table,
  isLoading = false,
  isError = false,
  onRetry,
  emptyTitle,
  emptyDescription,
}: DataTableProps<TData>) {
  if (isLoading) {
    return <DataTableLoading />
  }

  if (isError) {
    return <DataTableError onRetry={onRetry} />
  }

  const rows = table.getRowModel().rows

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/35">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sortedState = header.column.getIsSorted()

                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-1 text-left",
                          canSort
                            ? "cursor-pointer select-none text-foreground"
                            : "cursor-default text-muted-foreground"
                        )}
                        onClick={
                          canSort
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort ? (
                          sortedState === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : sortedState === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 text-muted-foreground" />
                          )
                        ) : null}
                      </button>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={table.getAllColumns().length} className="p-6">
                <DataTableEmpty
                  title={emptyTitle}
                  description={emptyDescription}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  )
}
