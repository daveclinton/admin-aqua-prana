"use client"

import { useState } from "react"
import { useQueryState, parseAsStringLiteral } from "nuqs"
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
import { Users, ShieldCheck, Waves, UserCheck, Plus } from "lucide-react"
import {
  getFarmers,
  getFarmerStats,
  createFarmer,
  type CreateFarmerData,
} from "@/features/farmers/api"
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
  const queryClient = useQueryClient()
  const [action, setAction] = useQueryState(
    "action",
    parseAsStringLiteral(["add-farmer"] as const).withOptions({ history: "push" })
  )
  const addOpen = action === "add-farmer"
  const setAddOpen = (open: boolean) => void setAction(open ? "add-farmer" : null)

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

  const statsQuery = useQuery({
    queryKey: queryKeys.farmers.stats,
    queryFn: getFarmerStats,
  })
  const stats = statsQuery.data

  const createMutation = useMutation({
    mutationFn: (data: CreateFarmerData) => createFarmer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmers"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.overview.stats })
      queryClient.invalidateQueries({ queryKey: queryKeys.overview.alerts })
      setAddOpen(false)
      toast.success("Farmer created successfully")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create farmer")
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
              title="Total Farmers"
              value={(stats?.total_farmers ?? rowCount).toLocaleString()}
              subtitle={stats ? `${stats.new_last_30d} new this month` : undefined}
              icon={Users}
              variant="green"
            />
            <KpiCard
              title="Active Farmers"
              value={(stats?.active_farmers ?? 0).toLocaleString()}
              icon={UserCheck}
              variant="teal"
            />
            <KpiCard
              title="Verified"
              value={(stats?.verified_farmers ?? 0).toLocaleString()}
              icon={ShieldCheck}
              variant="amber"
            />
            <KpiCard
              title="Total Ponds"
              value={(stats?.total_ponds ?? 0).toLocaleString()}
              subtitle={stats ? `${stats.active_ponds} active` : undefined}
              icon={Waves}
              variant="teal"
            />
          </>
        )}
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-xs shadow-black/5">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <DataTableToolbar
            table={table}
            searchPlaceholder="Search farmers by name, email, or phone"
          />
          <Button size="sm" onClick={() => setAddOpen(true)} className="shrink-0">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Farmer
          </Button>
        </div>
        <DataTable
          table={table}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          emptyTitle="No farmers match this view"
          emptyDescription="Try a different search term or reset the current filters."
        />
      </section>

      {/* Add farmer sheet */}
      <AddFarmerSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />
    </div>
  )
}

/* ── Add farmer sheet ── */

function AddFarmerSheet({
  open,
  onOpenChange,
  onSave,
  isPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CreateFarmerData) => void
  isPending: boolean
}) {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [region, setRegion] = useState("")
  const [orgName, setOrgName] = useState("")
  const [language, setLanguage] = useState("en")

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setEmail("")
      setFirstName("")
      setLastName("")
      setPhone("")
      setRegion("")
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
      region: region.trim() || undefined,
      organization_name: orgName.trim() || undefined,
      language: language.trim() || "en",
    })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Farmer</SheetTitle>
          <SheetDescription>Create a new farmer account.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
          <FormField label="Email *">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="farmer@example.com" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First name *">
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
            </FormField>
            <FormField label="Last name *">
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
            </FormField>
          </div>
          <FormField label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
          </FormField>
          <FormField label="Region">
            <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Andhra Pradesh" />
          </FormField>
          <FormField label="Organization">
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Aqua Farms Ltd" />
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
              {isPending ? "Creating..." : "Create farmer"}
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
