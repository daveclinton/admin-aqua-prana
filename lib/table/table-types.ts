import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"

export type DataTableState = {
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  columnVisibility: VisibilityState
  rowSelection: Record<string, boolean>
  globalFilter: string
}

export type DataTableOptions<TData extends RowData> = {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  state: DataTableState
  pageCount?: number
  totalRows?: number
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  onPaginationChange: OnChangeFn<PaginationState>
  onSortingChange: OnChangeFn<SortingState>
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  onGlobalFilterChange?: OnChangeFn<string>
}

export type DataTableQueryResult<TData> = {
  rows: TData[]
  rowCount: number
  pageCount: number
}
