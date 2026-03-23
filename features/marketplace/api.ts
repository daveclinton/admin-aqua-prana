import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type { ProductDTO, ProductRow, OrderDTO, OrderRow, SellerDTO, MarketplaceStats } from "./types"
import type { DataTableQueryResult } from "@/lib/table/table-types"

/* ── Analytics ── */

export async function getMarketplaceStats(): Promise<MarketplaceStats> {
  const res = await api<ApiSuccessResponse<Record<string, unknown>>>(
    "/v1/admin/analytics/marketplace?range=30d"
  )
  const d = res.data
  const totalRevenue = Number(d.total_revenue ?? d.revenue_total ?? 0)
  const totalOrders = Number(d.total_orders ?? 1)
  return {
    total_revenue: totalRevenue,
    avg_order_value: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    pending_payouts: Number(d.pending_payouts ?? 0),
  }
}

/* ── Products ── */

type ProductsResponse = {
  products: ProductDTO[]
  total: number
}

type GetProductsParams = {
  pageIndex: number
  pageSize: number
  globalFilter: string
  category?: string
  status?: string
}

export async function getProducts(
  params: GetProductsParams
): Promise<DataTableQueryResult<ProductRow>> {
  const searchParams = new URLSearchParams({
    limit: String(params.pageSize),
    offset: String(params.pageIndex * params.pageSize),
  })

  if (params.globalFilter) searchParams.set("search", params.globalFilter)
  if (params.category) searchParams.set("category", params.category)
  if (params.status) searchParams.set("status", params.status)

  const res = await api<ApiSuccessResponse<ProductsResponse>>(
    `/v1/admin/marketplace/products?${searchParams}`
  )

  const rows = res.data.products.map(mapProductDTOToRow)
  const pageCount = Math.max(1, Math.ceil(res.data.total / params.pageSize))

  return { rows, rowCount: res.data.total, pageCount }
}

/* ── Product mutations ── */

export type CreateProductData = {
  seller_id: string
  name: string
  description?: string
  category?: string
  price: number
  currency?: string
  stock: number
  unit?: string
  status?: string
}

export async function createProduct(data: CreateProductData) {
  const res = await api<ApiSuccessResponse<Record<string, unknown>>>(
    "/v1/admin/marketplace/products",
    { method: "POST", body: data }
  )
  return res.data
}

export type UpdateProductData = {
  name?: string
  description?: string | null
  category?: string
  price?: number
  currency?: string
  stock?: number
  unit?: string
  status?: string
}

export async function updateProduct(id: string, data: UpdateProductData) {
  const res = await api<ApiSuccessResponse<Record<string, unknown>>>(
    `/v1/admin/marketplace/products/${id}`,
    { method: "PATCH", body: data }
  )
  return res.data
}

export async function deleteProduct(id: string) {
  const res = await api<ApiSuccessResponse<{ deleted: boolean }>>(
    `/v1/admin/marketplace/products/${id}`,
    { method: "DELETE" }
  )
  return res.data
}

/* ── Order mutations ── */

export async function updateOrderStatus(id: string, status: string) {
  const res = await api<ApiSuccessResponse<Record<string, unknown>>>(
    `/v1/admin/marketplace/orders/${id}`,
    { method: "PATCH", body: { status } }
  )
  return res.data
}

export async function getOrderDetail(id: string) {
  const res = await api<ApiSuccessResponse<Record<string, unknown>>>(
    `/v1/admin/marketplace/orders/${id}`
  )
  return res.data
}

function mapProductDTOToRow(dto: ProductDTO): ProductRow {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category || "-",
    price: dto.price,
    currency: dto.currency || "INR",
    orderCount: dto.order_count ?? 0,
    stock: dto.stock,
    status: dto.status || "draft",
  }
}

/* ── Orders ── */

type OrdersResponse = {
  orders: OrderDTO[]
  total: number
  status_counts: Record<string, number>
}

type GetOrdersParams = {
  pageIndex: number
  pageSize: number
  globalFilter: string
  status?: string
}

export async function getOrders(
  params: GetOrdersParams
): Promise<DataTableQueryResult<OrderRow> & { statusCounts: Record<string, number> }> {
  const searchParams = new URLSearchParams({
    limit: String(params.pageSize),
    offset: String(params.pageIndex * params.pageSize),
  })

  if (params.globalFilter) searchParams.set("search", params.globalFilter)
  if (params.status) searchParams.set("status", params.status)

  const res = await api<ApiSuccessResponse<OrdersResponse>>(
    `/v1/admin/marketplace/orders?${searchParams}`
  )

  const rows = res.data.orders.map(mapOrderDTOToRow)
  const pageCount = Math.max(1, Math.ceil(res.data.total / params.pageSize))

  return {
    rows,
    rowCount: res.data.total,
    pageCount,
    statusCounts: res.data.status_counts ?? {},
  }
}

function mapOrderDTOToRow(dto: OrderDTO): OrderRow {
  return {
    id: dto.id,
    details: dto.notes || "Order",
    amount: dto.total,
    currency: dto.currency || "INR",
    date: dto.placed_at,
    status: dto.status || "pending",
    seller: dto.seller_name || dto.seller_email,
  }
}

/* ── Sellers ── */

export async function getSellers(): Promise<SellerDTO[]> {
  const res = await api<ApiSuccessResponse<{ sellers: SellerDTO[] }>>(
    "/v1/admin/marketplace/sellers"
  )
  return res.data.sellers
}
