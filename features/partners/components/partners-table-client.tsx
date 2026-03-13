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
import { Users, ShieldCheck, Zap, UserPlus } from "lucide-react"
import { getPartners, getPartnerStats } from "@/features/partners/api"
import { partnerColumns } from "@/features/partners/tables/partner-columns"
import type { PartnerRow } from "@/features/partners/types"
import { queryKeys } from "@/lib/react-query/query-keys"
import { useDataTable } from "@/hooks/table/use-data-table"
import type { DataTableState } from "@/lib/table/table-types"
import {
  createTableSearchParams,
  parseSortingState,
} from "@/lib/table/table-search-params"
import { getSortingValue, resolveUpdater } from "@/lib/table/table-utils"

const partnersTableSearchParams = createTableSearchParams({
  defaultPageSize: 10,
  defaultSort: "createdAt.desc",
  urlKeys: {
    globalFilter: "q",
    pageIndex: "page",
    pageSize: "size",
    sort: "sort",
  },
})

export function PartnersTableClient() {
  const [queryState, setQueryState] = useQueryStates(
    partnersTableSearchParams.parsers,
    {
      history: "replace",
      urlKeys: partnersTableSearchParams.urlKeys,
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
    queryKey: queryKeys.partners.all({
      page: queryState.pageIndex,
      size: queryState.pageSize,
      q: queryState.globalFilter,
      sort: queryState.sort,
    }),
    queryFn: () =>
      getPartners({
        pageIndex: queryState.pageIndex,
        pageSize: queryState.pageSize,
        globalFilter: queryState.globalFilter,
      }),
    placeholderData: keepPreviousData,
  })

  const rows = query.data?.rows ?? []
  const rowCount = query.data?.rowCount ?? 0
  const pageCount = query.data?.pageCount ?? 1

  const table = useDataTable<PartnerRow>({
    data: rows,
    columns: partnerColumns,
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

  const statsQuery = useQuery({
    queryKey: queryKeys.partners.stats,
    queryFn: getPartnerStats,
  })
  const stats = statsQuery.data

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-2xl" />
          ))
        ) : (
          <>
            <KpiCard
              title="Total Partners"
              value={(stats?.total_partners ?? rowCount).toLocaleString()}
              subtitle={stats ? `${stats.new_last_30d} new this month` : undefined}
              icon={Users}
              variant="amber"
            />
            <KpiCard
              title="Active Partners"
              value={(stats?.active_partners ?? 0).toLocaleString()}
              icon={Zap}
              variant="green"
            />
            <KpiCard
              title="Verified"
              value={(stats?.verified_partners ?? 0).toLocaleString()}
              icon={ShieldCheck}
              variant="teal"
            />
            <KpiCard
              title="Activated"
              value={(stats?.activated_partners ?? 0).toLocaleString()}
              icon={UserPlus}
              variant="green"
            />
          </>
        )}
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-xs shadow-black/5">
        <DataTableToolbar
          table={table}
          searchPlaceholder="Search partners by name, email, or organization"
        />
        <DataTable
          table={table}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          emptyTitle="No partners match this view"
          emptyDescription="Try a different search term or reset the current filters."
        />
      </section>
    </div>
  )
}
