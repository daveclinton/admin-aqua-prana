"use client"

import { useState } from "react"
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table"
import { useMemo } from "react"
import { useQueryStates } from "nuqs"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { DataTable } from "@/components/table/data-table"
import { DataTableToolbar } from "@/components/table/data-table-toolbar"
import {
  getOrders,
  getOrderDetail,
  updateOrderStatus,
} from "@/features/marketplace/api"
import { orderColumns } from "@/features/marketplace/tables/order-columns"
import type { OrderRow } from "@/features/marketplace/types"
import { queryKeys } from "@/lib/react-query/query-keys"
import { useDataTable } from "@/hooks/table/use-data-table"
import type { DataTableState } from "@/lib/table/table-types"
import {
  createTableSearchParams,
  parseSortingState,
} from "@/lib/table/table-search-params"
import { getSortingValue, resolveUpdater } from "@/lib/table/table-utils"
import { formatTableDate } from "@/lib/table/table-utils"

const ordersSearchParams = createTableSearchParams({
  defaultPageSize: 10,
  defaultSort: "placedAt.desc",
  urlKeys: { globalFilter: "oq", pageIndex: "opage", pageSize: "osize", sort: "osort" },
})

export function OrdersTableClient() {
  const queryClient = useQueryClient()
  const [viewOrderId, setViewOrderId] = useState<string | null>(null)

  const [queryState, setQueryState] = useQueryStates(
    ordersSearchParams.parsers,
    { history: "replace", urlKeys: ordersSearchParams.urlKeys }
  )
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const pagination: PaginationState = {
    pageIndex: queryState.pageIndex,
    pageSize: queryState.pageSize,
  }
  const sorting = useMemo(
    () => parseSortingState(queryState.sort, "placedAt"),
    [queryState.sort]
  )
  const tableState: DataTableState = {
    pagination, sorting, columnFilters, columnVisibility, rowSelection,
    globalFilter: queryState.globalFilter,
  }

  const query = useQuery({
    queryKey: queryKeys.marketplace.orders({
      page: queryState.pageIndex, size: queryState.pageSize,
      q: queryState.globalFilter, sort: queryState.sort,
    }),
    queryFn: () => getOrders({
      pageIndex: queryState.pageIndex, pageSize: queryState.pageSize,
      globalFilter: queryState.globalFilter,
    }),
    placeholderData: keepPreviousData,
  })

  const statusCounts = (query.data as Record<string, unknown> | undefined)?.statusCounts as Record<string, number> | undefined

  // Wire up View button
  const columnsWithActions = orderColumns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }: { row: { original: OrderRow } }) => (
          <Button variant="outline" size="sm" onClick={() => setViewOrderId(row.original.id)}>
            View
          </Button>
        ),
      }
    }
    return col
  })

  const rows = query.data?.rows ?? []
  const rowCount = query.data?.rowCount ?? 0
  const pageCount = query.data?.pageCount ?? 1

  const table = useDataTable<OrderRow>({
    data: rows,
    columns: columnsWithActions,
    state: tableState,
    totalRows: rowCount,
    pageCount,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: (u) => {
      const n = resolveUpdater(u, pagination)
      void setQueryState({ pageIndex: n.pageIndex, pageSize: n.pageSize })
    },
    onSortingChange: (u) => {
      const n = resolveUpdater(u, sorting)
      void setQueryState({ pageIndex: 0, sort: getSortingValue(n, "placedAt.desc") })
    },
    onColumnFiltersChange: (u) => setColumnFilters((c) => resolveUpdater(u, c)),
    onColumnVisibilityChange: (u) => setColumnVisibility((c) => resolveUpdater(u, c)),
    onRowSelectionChange: (u) => setRowSelection((c) => resolveUpdater(u, c)),
    onGlobalFilterChange: (v) => {
      void setQueryState({ globalFilter: resolveUpdater(v, queryState.globalFilter), pageIndex: 0 })
    },
  })

  const statusBadges = [
    { key: "shipped", label: "Shipped", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
    { key: "completed", label: "Completed", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
    { key: "delivered", label: "Delivered", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
    { key: "cancelled", label: "Cancelled", cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
    { key: "refunding", label: "Refunding", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  ]

  return (
    <>
      <section className="overflow-hidden rounded-2xl border bg-card shadow-xs shadow-black/5">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold">Orders</h3>
          {statusCounts && (
            <div className="flex items-center gap-2">
              {statusBadges.map(({ key, label, cls }) => {
                const count = statusCounts[key]
                if (!count) return null
                return (
                  <span key={key} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
                    {count} {label}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        <DataTableToolbar table={table} searchPlaceholder="Search by order #, farmer, product..." />
        <DataTable
          table={table}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          emptyTitle="No orders found"
          emptyDescription="Try a different search term or reset the current filters."
        />
      </section>

      {/* Order detail sheet */}
      <OrderDetailSheet
        orderId={viewOrderId}
        onClose={() => setViewOrderId(null)}
        onStatusUpdate={() => {
          queryClient.invalidateQueries({ queryKey: ["marketplace"] })
        }}
      />
    </>
  )
}

/* ── Order detail sheet ── */

function OrderDetailSheet({
  orderId,
  onClose,
  onStatusUpdate,
}: {
  orderId: string | null
  onClose: () => void
  onStatusUpdate: () => void
}) {
  const { data: order, isLoading } = useQuery({
    queryKey: queryKeys.marketplace.orderDetail(orderId ?? ""),
    queryFn: () => getOrderDetail(orderId!),
    enabled: !!orderId,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      onStatusUpdate()
      toast.success("Order status updated")
    },
    onError: () => toast.error("Failed to update status"),
  })

  const o = order as Record<string, unknown> | undefined
  const items = (o?.items as Record<string, unknown>[]) ?? []
  const currentStatus = String(o?.status ?? "pending")

  const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]

  return (
    <Sheet open={!!orderId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Order #{orderId?.slice(0, 8)}</SheetTitle>
          <SheetDescription>Order details and management</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-6 pt-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !o ? (
            <p className="text-sm text-muted-foreground">Order not found</p>
          ) : (
            <>
              {/* Status */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-sm">{currentStatus}</Badge>
                <select
                  value={currentStatus}
                  onChange={(e) =>
                    orderId && statusMutation.mutate({ id: orderId, status: e.target.value })
                  }
                  disabled={statusMutation.isPending}
                  className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm">
                <DetailRow label="Buyer" value={String(o.buyer_name || o.buyer_email)} />
                <DetailRow label="Seller" value={String(o.seller_name || o.seller_email)} />
                <DetailRow label="Total" value={`₹${Number(o.total).toLocaleString()}`} />
                <DetailRow label="Placed" value={formatTableDate(String(o.placed_at))} />
                {o.shipping_address && (
                  <DetailRow label="Shipping" value={String(o.shipping_address)} />
                )}
                {o.notes && <DetailRow label="Notes" value={String(o.notes)} />}
              </div>

              {/* Items */}
              {items.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Items
                  </p>
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {items.map((item) => (
                          <div key={String(item.id)} className="flex items-center justify-between px-4 py-3 text-sm">
                            <div>
                              <p className="font-medium">{String(item.product_name)}</p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {Number(item.quantity)} × ₹{Number(item.unit_price).toLocaleString()}
                              </p>
                            </div>
                            <p className="font-medium">₹{Number(item.subtotal).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-medium">{value}</span>
    </div>
  )
}
