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
import { DataTable } from "@/components/table/data-table"
import { DataTableToolbar } from "@/components/table/data-table-toolbar"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Users, ShieldCheck, Zap, UserPlus, Plus } from "lucide-react"
import {
  getPartners,
  getPartnerStats,
  createPartner,
  type CreatePartnerData,
} from "@/features/partners/api"
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
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
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

  const createMutation = useMutation({
    mutationFn: (data: CreatePartnerData) => createPartner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.overview.stats })
      queryClient.invalidateQueries({ queryKey: queryKeys.overview.alerts })
      setAddOpen(false)
      toast.success("Partner created successfully")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create partner")
    },
  })

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
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold">Partners</h2>
          <div className="flex items-center gap-3">
            <DataTableToolbar
              table={table}
              searchPlaceholder="Search partners by name, email, or organization"
            />
            <Button size="sm" onClick={() => setAddOpen(true)} className="shrink-0">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Partner
            </Button>
          </div>
        </div>
        <DataTable
          table={table}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          emptyTitle="No partners match this view"
          emptyDescription="Try a different search term or reset the current filters."
        />
      </section>

      <AddPartnerSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />
    </div>
  )
}

/* ── Add partner sheet ── */

function AddPartnerSheet({
  open,
  onOpenChange,
  onSave,
  isPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CreatePartnerData) => void
  isPending: boolean
}) {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [orgName, setOrgName] = useState("")
  const [language, setLanguage] = useState("en")

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setEmail("")
      setFirstName("")
      setLastName("")
      setPhone("")
      setOrgName("")
      setLanguage("en")
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { toast.error("Email is required"); return }
    if (!firstName.trim()) { toast.error("First name is required"); return }
    if (!lastName.trim()) { toast.error("Last name is required"); return }
    onSave({
      email: email.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim() || undefined,
      organization_name: orgName.trim() || undefined,
      language: language.trim() || "en",
    })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Partner</SheetTitle>
          <SheetDescription>Create a new partner account.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
          <FormField label="Email *">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="partner@example.com" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First name *">
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
            </FormField>
            <FormField label="Last name *">
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" />
            </FormField>
          </div>
          <FormField label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
          </FormField>
          <FormField label="Organization">
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Aqua Partners Inc" />
          </FormField>
          <FormField label="Language">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="en">English</option>
              <option value="bn">Bengali</option>
              <option value="es">Spanish</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="hi">Hindi</option>
            </select>
          </FormField>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Creating..." : "Create partner"}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleOpen(false)}>Cancel</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
