import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type { ProductDTO, ProductRow, OrderDTO, OrderRow } from "./types"
import type { DataTableQueryResult } from "@/lib/table/table-types"

type ProductsResponse = {
  products: ProductDTO[]
  total: number
}

type OrdersResponse = {
  orders: OrderDTO[]
  total: number
}

type GetProductsParams = {
  pageIndex: number
  pageSize: number
  globalFilter: string
  category?: string
  status?: string
}

type GetOrdersParams = {
  pageIndex: number
  pageSize: number
  globalFilter: string
  status?: string
}

export async function getProducts(
  params: GetProductsParams
): Promise<DataTableQueryResult<ProductRow>> {
  const searchParams = new URLSearchParams({
    limit: String(params.pageSize),
    offset: String(params.pageIndex * params.pageSize),
  })

  if (params.globalFilter) {
    searchParams.set("search", params.globalFilter)
  }
  if (params.category) {
    searchParams.set("category", params.category)
  }
  if (params.status) {
    searchParams.set("status", params.status)
  }

  const res = await api<ApiSuccessResponse<ProductsResponse>>(
    `/v1/admin/marketplace/products?${searchParams}`
  )

  const rows = res.data.products.map(mapProductDTOToRow)
  const pageCount = Math.max(
    1,
    Math.ceil(res.data.total / params.pageSize)
  )

  return {
    rows,
    rowCount: res.data.total,
    pageCount,
  }
}

export async function getOrders(
  params: GetOrdersParams
): Promise<DataTableQueryResult<OrderRow>> {
  const searchParams = new URLSearchParams({
    limit: String(params.pageSize),
    offset: String(params.pageIndex * params.pageSize),
  })

  if (params.globalFilter) {
    searchParams.set("search", params.globalFilter)
  }
  if (params.status) {
    searchParams.set("status", params.status)
  }

  const res = await api<ApiSuccessResponse<OrdersResponse>>(
    `/v1/admin/marketplace/orders?${searchParams}`
  )

  const rows = res.data.orders.map(mapOrderDTOToRow)
  const pageCount = Math.max(
    1,
    Math.ceil(res.data.total / params.pageSize)
  )

  return {
    rows,
    rowCount: res.data.total,
    pageCount,
  }
}

function mapProductDTOToRow(dto: ProductDTO): ProductRow {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category || "-",
    price: dto.price,
    currency: dto.currency || "KES",
    stock: dto.stock,
    status: dto.status || "draft",
    sellerName: dto.seller_name || dto.seller_email,
    sellerEmail: dto.seller_email,
    createdAt: dto.created_at,
  }
}

function mapOrderDTOToRow(dto: OrderDTO): OrderRow {
  return {
    id: dto.id,
    status: dto.status || "pending",
    total: dto.total,
    currency: dto.currency || "KES",
    buyerName: dto.buyer_name || dto.buyer_email,
    buyerEmail: dto.buyer_email,
    sellerName: dto.seller_name || dto.seller_email,
    sellerEmail: dto.seller_email,
    placedAt: dto.placed_at,
  }
}
