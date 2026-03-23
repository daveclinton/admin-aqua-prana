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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Activity,
  AlertTriangle,
  BookOpen,
  ShieldAlert,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Users,
  Waves,
} from "lucide-react"
import { PassbookMonitoringMap } from "@/features/passbook/components/passbook-monitoring-map"
import {
  getPassbookEntries,
  getPassbookMonitoringSummary,
  getPassbookStats,
} from "@/features/passbook/api"
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
  const monitoringQuery = useQuery({
    queryKey: queryKeys.passbook.monitoring,
    queryFn: getPassbookMonitoringSummary,
  })
  const monitoring = monitoringQuery.data
  const scoreBandCards = monitoring ? [
    { label: "Excellent", value: monitoring.score_bands.excellent, variant: "green" as const },
    { label: "Good", value: monitoring.score_bands.good, variant: "teal" as const },
    { label: "Fair", value: monitoring.score_bands.fair, variant: "amber" as const },
    { label: "Poor/Critical", value: monitoring.score_bands.poor + monitoring.score_bands.critical, variant: "red" as const },
  ] : []

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Monitoring Overview</h2>
            <p className="text-xs text-muted-foreground">
              Pond score, alert, and passbook health signals rolled up for admins.
            </p>
          </div>
          {monitoring?.generated_at ? (
            <p className="text-xs text-muted-foreground">
              Updated {new Date(monitoring.generated_at).toLocaleString()}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {monitoringQuery.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-2xl" />
            ))
          ) : (
            <>
              <KpiCard
                title="Active Pond Alerts"
                value={(monitoring?.overview.total_unresolved_alerts ?? 0).toLocaleString()}
                subtitle={`${monitoring?.overview.critical_alerts ?? 0} critical`}
                icon={ShieldAlert}
                variant="red"
              />
              <KpiCard
                title="Average Pond Score"
                value={`${monitoring?.overview.avg_overall_score ?? 0}`}
                subtitle={`${monitoring?.overview.total_ponds ?? 0} monitored ponds`}
                icon={Activity}
                variant="teal"
              />
              <KpiCard
                title="Mapped Ponds"
                value={(monitoring?.overview.mapped_ponds ?? 0).toLocaleString()}
                subtitle="With latitude & longitude"
                icon={Waves}
                variant="green"
              />
              <KpiCard
                title="Recent Passbook Activity"
                value={(monitoring?.overview.recent_passbook_entries ?? 0).toLocaleString()}
                subtitle={`${monitoring?.overview.mortality_reports_24h ?? 0} mortality reports in 24h`}
                icon={BookOpen}
                variant="amber"
              />
            </>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Parameter Alert Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {monitoringQuery.isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))
              ) : !(monitoring?.parameter_alerts ?? []).length ? (
                <div className="sm:col-span-2 xl:col-span-3 rounded-xl border border-dashed bg-muted/10 p-6 text-center">
                  <p className="text-sm font-medium">No active parameter alerts yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Submit readings or wait for pond alerts to be generated.
                  </p>
                </div>
              ) : (
                (monitoring?.parameter_alerts ?? []).slice(0, 6).map((item) => (
                  <div key={item.parameter} className="rounded-xl border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </p>
                      <Thermometer className="size-4 text-muted-foreground" />
                    </div>
                    <p className="mt-3 text-2xl font-bold">{item.total}</p>
                    <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                      <span>{item.critical} critical</span>
                      <span>{item.warning} warning</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Score Bands</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {monitoringQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))
              ) : (
                scoreBandCards.map((band) => (
                  <div key={band.label} className="flex items-center justify-between rounded-xl border px-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{band.label}</p>
                      <p className="text-xs text-muted-foreground">Latest pond score distribution</p>
                    </div>
                    <Badge variant={band.variant === "red" ? "destructive" : band.variant === "amber" ? "outline" : "default"}>
                      {band.value}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Mapped Pond Hotspots</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {monitoringQuery.isLoading ? (
                <Skeleton className="h-[420px] rounded-2xl" />
              ) : (
                <PassbookMonitoringMap points={monitoring?.map_points ?? []} />
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Regional Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {monitoringQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-18 rounded-xl" />
                ))
              ) : !(monitoring?.regional_breakdown ?? []).length ? (
                <div className="rounded-xl border border-dashed bg-muted/10 p-6 text-center">
                  <p className="text-sm font-medium">No regional pond data yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Regional summaries will appear once farmer region data and pond monitoring data are available.
                  </p>
                </div>
              ) : (
                (monitoring?.regional_breakdown ?? []).map((region) => (
                  <div key={region.region} className="rounded-xl border px-3 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{region.region}</p>
                      <Badge variant={region.critical_alerts > 0 ? "destructive" : "outline"}>
                        {region.pond_count} ponds
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{region.critical_alerts} critical</span>
                      <span>{region.active_alerts} active alerts</span>
                      <span>{region.healthy_ponds} healthy</span>
                      <span>avg {region.avg_score}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Top Missing Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {monitoringQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))
              ) : !(monitoring?.missing_data ?? []).length ? (
                <div className="rounded-xl border border-dashed bg-muted/10 p-6 text-center">
                  <p className="text-sm font-medium">No missing-data signals yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This panel will fill in once ponds start reporting recent parameter readings.
                  </p>
                </div>
              ) : (
                (monitoring?.missing_data ?? []).slice(0, 6).map((item) => (
                  <div key={item.parameter} className="flex items-center justify-between rounded-xl border px-3 py-3">
                    <p className="text-sm font-medium">{item.label}</p>
                    <Badge variant="outline">{item.count} ponds</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Irregular Flags</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {monitoringQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))
              ) : (
                <>
                  <MiniFlagCard title="Data Gaps" value={monitoring?.irregular_flags.data_gaps ?? 0} icon={AlertTriangle} />
                  <MiniFlagCard title="Critical Score Ponds" value={monitoring?.irregular_flags.critical_score_ponds ?? 0} icon={TrendingDown} />
                  <MiniFlagCard title="Low Confidence Scores" value={monitoring?.irregular_flags.low_confidence_ponds ?? 0} icon={Activity} />
                  <MiniFlagCard title="Mortality Reports 24h" value={monitoring?.irregular_flags.mortality_reports_24h ?? 0} icon={Waves} />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

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

function MiniFlagCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: number
  icon: typeof AlertTriangle
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  )
}
