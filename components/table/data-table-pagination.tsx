"use client"

import type { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type DataTablePaginationProps<TData> = {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = Math.max(table.getPageCount(), 1)
  const rowCount = table.getRowCount()
  const pageSize = table.getState().pagination.pageSize
  const start = rowCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, rowCount)
  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Showing {start}-{end} of {rowCount}
        </span>
        {selectedCount ? <span>{selectedCount} selected</span> : null}
      </div>
      <div className="flex items-center gap-2">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Go to next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
