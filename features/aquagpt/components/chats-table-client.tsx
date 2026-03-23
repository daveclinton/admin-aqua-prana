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
import { getAquagptChats } from "@/features/aquagpt/api"
import { chatColumns } from "@/features/aquagpt/tables/chat-columns"
import type { ChatRow } from "@/features/aquagpt/types"
import { queryKeys } from "@/lib/react-query/query-keys"
import { useDataTable } from "@/hooks/table/use-data-table"
import type { DataTableState } from "@/lib/table/table-types"
import {
  createTableSearchParams,
  parseSortingState,
} from "@/lib/table/table-search-params"
import { getSortingValue, resolveUpdater } from "@/lib/table/table-utils"

const chatsSearchParams = createTableSearchParams({
  defaultPageSize: 20,
  defaultSort: "lastActive.desc",
  urlKeys: {
    globalFilter: "cq",
    pageIndex: "cpage",
    pageSize: "csize",
    sort: "csort",
  },
})

export function ChatsTableClient() {
  const [queryState, setQueryState] = useQueryStates(
    chatsSearchParams.parsers,
    { history: "replace", urlKeys: chatsSearchParams.urlKeys }
  )
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const pagination: PaginationState = {
    pageIndex: queryState.pageIndex,
    pageSize: queryState.pageSize,
  }

  const sorting = useMemo(
    () => parseSortingState(queryState.sort, "lastActive"),
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
    queryKey: queryKeys.aquagpt.chats({
      page: queryState.pageIndex,
      size: queryState.pageSize,
      q: queryState.globalFilter,
      sort: queryState.sort,
    }),
    queryFn: () =>
      getAquagptChats({
        pageIndex: queryState.pageIndex,
        pageSize: queryState.pageSize,
        globalFilter: queryState.globalFilter,
      }),
    placeholderData: keepPreviousData,
  })

  const rows = query.data?.rows ?? []
  const rowCount = query.data?.rowCount ?? 0
  const pageCount = query.data?.pageCount ?? 1

  const table = useDataTable<ChatRow>({
    data: rows,
    columns: chatColumns,
    state: tableState,
    totalRows: rowCount,
    pageCount,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: (updater) => {
      const next = resolveUpdater(updater, pagination)
      void setQueryState({ pageIndex: next.pageIndex, pageSize: next.pageSize })
    },
    onSortingChange: (updater) => {
      const next = resolveUpdater(updater, sorting)
      void setQueryState({ pageIndex: 0, sort: getSortingValue(next, "lastActive.desc") })
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters((c) => resolveUpdater(updater, c))
    },
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility((c) => resolveUpdater(updater, c))
    },
    onRowSelectionChange: (updater) => {
      setRowSelection((c) => resolveUpdater(updater, c))
    },
    onGlobalFilterChange: (value) => {
      const next = resolveUpdater(value, queryState.globalFilter)
      void setQueryState({ globalFilter: next, pageIndex: 0 })
    },
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Chats</h3>
          <p className="text-xs text-muted-foreground">Click any row to view full chat transcript</p>
        </div>
      </div>
      <section className="overflow-hidden rounded-2xl border bg-card shadow-xs shadow-black/5">
        <DataTableToolbar
          table={table}
          searchPlaceholder="Search chats..."
        />
        <DataTable
          table={table}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          emptyTitle="No chats found"
          emptyDescription="No AquaGPT chats have been recorded yet."
        />
      </section>
    </div>
  )
}
