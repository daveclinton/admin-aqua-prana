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
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, TrendingUp, TrendingDown, Users, Waves } from "lucide-react"
import { getPassbookEntries, getPassbookStats } from "@/features/passbook/api"
import { passbookColumns } from "@/features/passbook/tables/passbook-columns"
import type { PassbookEntryRow } from "@/features/passbook/types"
import { queryKeys } from "@/lib/react-query/query-keys"
import { useDataTable } from "@/hooks/table/use-data-table"
import type { DataTableState } from "@/lib/table/table-types"
import {
  createTableSearchParams,
  parseSortingState,
} from "@/lib/table/table-search-params"
import { getSortingValue, resolveUpdater } from "@/lib/table/table-utils"

const passbookSearchParams = createTableSearchParams({
  defaultPageSize: 10,
  defaultSort: "entryDate.desc",
  urlKeys: {
    globalFilter: "q",
    pageIndex: "page",
    pageSize: "size",
    sort: "sort",
  },
})

export function PassbookTableClient() {
  const [queryState, setQueryState] = useQueryStates(
    passbookSearchParams.parsers,
    {
      history: "replace",
      urlKeys: passbookSearchParams.urlKeys,
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
    () => parseSortingState(queryState.sort, "entryDate"),
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
    queryKey: queryKeys.passbook.entries({
      page: queryState.pageIndex,
      size: queryState.pageSize,
      q: queryState.globalFilter,
      sort: queryState.sort,
    }),
    queryFn: () =>
      getPassbookEntries({
        pageIndex: queryState.pageIndex,
        pageSize: queryState.pageSize,
        globalFilter: queryState.globalFilter,
      }),
    placeholderData: keepPreviousData,
  })

  const rows = query.data?.rows ?? []
  const rowCount = query.data?.rowCount ?? 0
  const pageCount = query.data?.pageCount ?? 1

  const table = useDataTable<PassbookEntryRow>({
    data: rows,
    columns: passbookColumns,
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
        sort: getSortingValue(nextSorting, "entryDate.desc"),
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

  const statsQuery = useQuery({
    queryKey: queryKeys.passbook.stats,
    queryFn: getPassbookStats,
  })
  const stats = statsQuery.data

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statsQuery.isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-2xl" />
          ))
        ) : (
          <>
            <KpiCard
              title="Total Entries"
              value={(stats?.total_entries ?? rowCount).toLocaleString()}
              icon={BookOpen}
              variant="green"
            />
            <KpiCard
              title="Credits"
              value={(stats?.total_credits ?? 0).toLocaleString()}
              icon={TrendingUp}
              variant="teal"
            />
            <KpiCard
              title="Debits"
              value={(stats?.total_debits ?? 0).toLocaleString()}
              icon={TrendingDown}
              variant="red"
            />
            <KpiCard
              title="Farmers"
              value={(stats?.unique_farmers ?? 0).toLocaleString()}
              icon={Users}
              variant="amber"
            />
            <KpiCard
              title="Ponds"
              value={(stats?.unique_ponds ?? 0).toLocaleString()}
              icon={Waves}
              variant="teal"
            />
          </>
        )}
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-xs shadow-black/5">
        <DataTableToolbar
          table={table}
          searchPlaceholder="Search entries by description, pond, or farmer email"
        />
        <DataTable
          table={table}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          emptyTitle="No passbook entries found"
          emptyDescription="Try a different search term or reset the current filters."
        />
      </section>
    </div>
  )
}
