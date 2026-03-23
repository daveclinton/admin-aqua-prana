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
import { CheckIcon, ChevronsUpDown, Plus } from "lucide-react"
import { SearchableInput } from "@/components/shared/searchable-input"
import { DataTable } from "@/components/table/data-table"
import { DataTableToolbar } from "@/components/table/data-table-toolbar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  getProducts,
  getSellers,
  createProduct,
  updateProduct,
  deleteProduct,
  type CreateProductData,
  type UpdateProductData,
} from "@/features/marketplace/api"
import { productColumns } from "@/features/marketplace/tables/product-columns"
import type { ProductRow } from "@/features/marketplace/types"
import { queryKeys } from "@/lib/react-query/query-keys"
import { useDataTable } from "@/hooks/table/use-data-table"
import type { DataTableState } from "@/lib/table/table-types"
import {
  createTableSearchParams,
  parseSortingState,
} from "@/lib/table/table-search-params"
import { getSortingValue, resolveUpdater } from "@/lib/table/table-utils"
import { PRODUCT_CATEGORY_OPTIONS } from "@/lib/constants/admin-form-options"

const productsSearchParams = createTableSearchParams({
  defaultPageSize: 10,
  defaultSort: "createdAt.desc",
  urlKeys: { globalFilter: "q", pageIndex: "page", pageSize: "size", sort: "sort" },
})

export function ProductsTableClient() {
  const queryClient = useQueryClient()
  const [action, setAction] = useQueryState(
    "action",
    parseAsStringLiteral(["add-product"] as const).withOptions({ history: "push" })
  )
  const addOpen = action === "add-product"
  const setAddOpen = (open: boolean) => void setAction(open ? "add-product" : null)
  const [editTarget, setEditTarget] = useState<ProductRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null)

  const [queryState, setQueryState] = useQueryStates(
    productsSearchParams.parsers,
    { history: "replace", urlKeys: productsSearchParams.urlKeys }
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
    pagination, sorting, columnFilters, columnVisibility, rowSelection,
    globalFilter: queryState.globalFilter,
  }

  const query = useQuery({
    queryKey: queryKeys.marketplace.products({
      page: queryState.pageIndex, size: queryState.pageSize,
      q: queryState.globalFilter, sort: queryState.sort,
    }),
    queryFn: () => getProducts({
      pageIndex: queryState.pageIndex, pageSize: queryState.pageSize,
      globalFilter: queryState.globalFilter,
    }),
    placeholderData: keepPreviousData,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["marketplace"] })
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateProductData) => createProduct(data),
    onSuccess: () => { invalidate(); setAddOpen(false); toast.success("Product created") },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to create product"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) => updateProduct(id, data),
    onSuccess: () => { invalidate(); setEditTarget(null); toast.success("Product updated") },
    onError: () => toast.error("Failed to update product"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => { invalidate(); setDeleteTarget(null); toast.success("Product deleted") },
    onError: () => toast.error("Failed to delete product"),
  })

  // Add action handlers to columns
  const columnsWithActions = productColumns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }: { row: { original: ProductRow } }) => (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setEditTarget(row.original)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => setDeleteTarget(row.original)}
            >
              Delete
            </Button>
          </div>
        ),
      }
    }
    return col
  })

  const rows = query.data?.rows ?? []
  const rowCount = query.data?.rowCount ?? 0
  const pageCount = query.data?.pageCount ?? 1

  const table = useDataTable<ProductRow>({
    data: rows,
    columns: columnsWithActions,
    state: tableState,
    totalRows: rowCount,
    pageCount,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: (updater) => {
      const n = resolveUpdater(updater, pagination)
      void setQueryState({ pageIndex: n.pageIndex, pageSize: n.pageSize })
    },
    onSortingChange: (updater) => {
      const n = resolveUpdater(updater, sorting)
      void setQueryState({ pageIndex: 0, sort: getSortingValue(n, "createdAt.desc") })
    },
    onColumnFiltersChange: (u) => setColumnFilters((c) => resolveUpdater(u, c)),
    onColumnVisibilityChange: (u) => setColumnVisibility((c) => resolveUpdater(u, c)),
    onRowSelectionChange: (u) => setRowSelection((c) => resolveUpdater(u, c)),
    onGlobalFilterChange: (v) => {
      void setQueryState({ globalFilter: resolveUpdater(v, queryState.globalFilter), pageIndex: 0 })
    },
  })

  return (
    <>
      <section className="overflow-hidden rounded-2xl border bg-card shadow-xs shadow-black/5">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold">Products</h3>
          <div className="flex items-center gap-3">
            <DataTableToolbar table={table} searchPlaceholder="Search products..." />
            <Button size="sm" className="shrink-0" onClick={() => setAddOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Product
            </Button>
          </div>
        </div>
        <DataTable
          table={table}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          emptyTitle="No products found"
          emptyDescription="Try a different search term or reset the current filters."
        />
      </section>

      {/* Add product sheet */}
      <ProductFormSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
        title="Add Product"
        description="Create a new marketplace product."
      />

      {/* Edit product sheet */}
      <ProductFormSheet
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSave={(data) => editTarget && updateMutation.mutate({ id: editTarget.id, data })}
        isPending={updateMutation.isPending}
        title="Edit Product"
        description="Update product details."
        defaults={editTarget ?? undefined}
        isEdit
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.name}&quot;. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/* ── Product form sheet ── */

function ProductFormSheet({
  open,
  onOpenChange,
  onSave,
  isPending,
  title,
  description,
  defaults,
  isEdit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  title: string
  description: string
  defaults?: ProductRow
} & (
  | {
      isEdit?: false
      onSave: (data: CreateProductData) => void
    }
  | {
      isEdit: true
      onSave: (data: UpdateProductData) => void
    }
)) {
  const [sellerId, setSellerId] = useState("")
  const [sellerOpen, setSellerOpen] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [status, setStatus] = useState("active")

  const { data: sellers } = useQuery({
    queryKey: queryKeys.marketplace.sellers,
    queryFn: getSellers,
    enabled: open && !isEdit,
  })

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setName(defaults?.name ?? "")
      setCategory(defaults?.category ?? "")
      setPrice(defaults?.price?.toString() ?? "")
      setStock(defaults?.stock?.toString() ?? "")
      setStatus(defaults?.status ?? "active")
      setSellerId("")
      setSellerOpen(false)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error("Name is required"); return }
    if (!price || Number(price) <= 0) { toast.error("Price must be positive"); return }
    if (!isEdit && !sellerId) { toast.error("Select a seller"); return }

    const baseData: UpdateProductData = {
      name: name.trim(),
      category: category.trim() || "Feed",
      price: Math.round(Number(price)),
      stock: parseInt(stock || "0", 10),
      status,
    }
    if (isEdit) {
      onSave(baseData)
      return
    }

    onSave({
      seller_id: sellerId,
      name: name.trim(),
      category: category.trim() || "Feed",
      price: Math.round(Number(price)),
      stock: parseInt(stock || "0", 10),
      status,
    })
  }

  const sellerOptions = (sellers ?? []).map((seller) => {
    const label = seller.seller_name?.trim() || seller.seller_email
    return {
      id: seller.seller_id,
      label,
      email: seller.seller_email,
      value: `${label} (${seller.seller_email})`,
    }
  })
  const selectedSeller = sellerOptions.find((seller) => seller.id === sellerId)

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
          {!isEdit && (
            <FormField label="Seller *">
              <Popover open={sellerOpen} onOpenChange={setSellerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={sellerOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedSeller ? selectedSeller.value : "Search and select seller"}
                    </span>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search seller by name or email..." />
                    <CommandList>
                      <CommandEmpty>No seller found.</CommandEmpty>
                      <CommandGroup>
                        {sellerOptions.map((seller) => (
                          <CommandItem
                            key={seller.id}
                            value={`${seller.label} ${seller.email}`}
                            onSelect={() => {
                              setSellerId(seller.id)
                              setSellerOpen(false)
                            }}
                            className="gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm">{seller.label}</div>
                              <div className="truncate text-xs text-muted-foreground">{seller.email}</div>
                            </div>
                            <CheckIcon
                              className={selectedSeller?.id === seller.id ? "size-4 opacity-100" : "size-4 opacity-0"}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormField>
          )}
          <FormField label="Product name *">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fish Feed 50kg" />
          </FormField>
          <FormField label="Category">
            <SearchableInput
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Select or type a category"
              options={PRODUCT_CATEGORY_OPTIONS.map((option) => ({ value: option }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Price (₹) *">
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 4500" />
            </FormField>
            <FormField label="Stock">
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g. 100" />
            </FormField>
          </div>
          <FormField label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              {isEdit && <option value="flagged">Flagged</option>}
              {isEdit && <option value="removed">Removed</option>}
            </select>
          </FormField>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Create product"}
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
