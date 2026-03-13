"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useQueryStates } from "nuqs"
import { DataTable } from "@/components/table/data-table"
import { DataTableToolbar } from "@/components/table/data-table-toolbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFarmers } from "@/features/farmers/api"
import { farmerColumns } from "@/features/farmers/tables/farmer-columns"
import type { FarmerRow } from "@/features/farmers/types"
import { queryKeys } from "@/lib/react-query/query-keys"
import { useDataTable } from "@/hooks/table/use-data-table"
import type { DataTableState } from "@/lib/table/table-types"
import {
  createTableSearchParams,
  parseSortingState,
} from "@/lib/table/table-search-params"
import { getSortingValue, resolveUpdater } from "@/lib/table/table-utils"

const farmersTableSearchParams = createTableSearchParams({
  defaultPageSize: 10,
  defaultSort: "createdAt.desc",
  urlKeys: {
    globalFilter: "q",
    pageIndex: "page",
    pageSize: "size",
    sort: "sort",
  },
})

export function FarmersTableClient() {
  const [queryState, setQueryState] = useQueryStates(
    farmersTableSearchParams.parsers,
    {
      history: "replace",
      urlKeys: farmersTableSearchParams.urlKeys,
    }
  )
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const pagination: PaginationState = {
    pageIndex: queryState.pageIndex,
    pageSize: queryState.pageSize,
  }

  const sorting = useMemo(
    () => parseSortingState(queryState.sort, "createdAt"),
    [queryState.sort]
  )

  const tableState: DataTableState = {
    pagination,
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    globalFilter: queryState.globalFilter,
  }

  const query = useQuery({
    queryKey: queryKeys.farmers.all({
      page: queryState.pageIndex,
      size: queryState.pageSize,
      q: queryState.globalFilter,
      sort: queryState.sort,
    }),
    queryFn: () =>
      getFarmers({
        pageIndex: queryState.pageIndex,
        pageSize: queryState.pageSize,
        globalFilter: queryState.globalFilter,
      }),
    placeholderData: keepPreviousData,
  })

  const rows = query.data?.rows ?? []
  const rowCount = query.data?.rowCount ?? 0
  const pageCount = query.data?.pageCount ?? 1

  const table = useDataTable<FarmerRow>({
    data: rows,
    columns: farmerColumns,
    state: tableState,
    totalRows: rowCount,
    pageCount,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: (updater) => {
      const nextPagination = resolveUpdater(updater, pagination)
      void setQueryState({
        pageIndex: nextPagination.pageIndex,
        pageSize: nextPagination.pageSize,
      })
    },
    onSortingChange: (updater) => {
      const nextSorting = resolveUpdater(updater, sorting)
      void setQueryState({
        pageIndex: 0,
        sort: getSortingValue(nextSorting, "createdAt.desc"),
      })
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters((current) => resolveUpdater(updater, current))
    },
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility((current) => resolveUpdater(updater, current))
    },
    onRowSelectionChange: (updater) => {
      setRowSelection((current) => resolveUpdater(updater, current))
    },
    onGlobalFilterChange: (value) => {
      const nextValue = resolveUpdater(value, queryState.globalFilter)
      void setQueryState({
        globalFilter: nextValue,
        pageIndex: 0,
      })
    },
  })

  const metrics = useMemo(
    () => [
      {
        label: "Total farmers",
        value: rowCount.toLocaleString(),
      },
      {
        label: "Selected rows",
        value: table.getFilteredSelectedRowModel().rows.length.toString(),
      },
      {
        label: "Active filters",
        value: queryState.globalFilter ? "1" : "0",
      },
    ],
    [queryState.globalFilter, rowCount, table]
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-xs shadow-black/5">
        <DataTableToolbar
          table={table}
          searchPlaceholder="Search farmers by name, email, or phone"
        />
        <DataTable
          table={table}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          emptyTitle="No farmers match this view"
          emptyDescription="Try a different search term or reset the current filters."
        />
      </section>
    </div>
  )
}
