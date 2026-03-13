"use client"

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type RowData,
} from "@tanstack/react-table"
import type { DataTableOptions } from "@/lib/table/table-types"

export function useDataTable<TData extends RowData>({
  data,
  columns,
  state,
  pageCount,
  totalRows,
  manualFiltering = false,
  manualPagination = false,
  manualSorting = false,
  onColumnFiltersChange,
  onColumnVisibilityChange,
  onGlobalFilterChange,
  onPaginationChange,
  onRowSelectionChange,
  onSortingChange,
}: DataTableOptions<TData>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  return useReactTable({
    data,
    columns,
    pageCount,
    rowCount: totalRows,
    state,
    manualFiltering,
    manualPagination,
    manualSorting,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange,
    onColumnVisibilityChange,
    onGlobalFilterChange,
    onPaginationChange,
    onRowSelectionChange,
    onSortingChange,
  })
}
