import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type {
  SubscriptionStatsDTO,
  InvoiceStatsDTO,
  SubscriptionDTO,
  InvoiceDTO,
  PlanDTO,
} from "@/features/billing/types"

export async function getSubscriptionStats(): Promise<SubscriptionStatsDTO> {
  const res = await api<ApiSuccessResponse<SubscriptionStatsDTO>>("/v1/admin/billing/stats?tab=subscriptions")
  return res.data
}

export async function getInvoiceStats(): Promise<InvoiceStatsDTO> {
  const res = await api<ApiSuccessResponse<InvoiceStatsDTO>>("/v1/admin/billing/stats?tab=invoices")
  return res.data
}

export async function getSubscriptions(params?: {
  search?: string; plan_id?: string; status?: string; limit?: number; offset?: number
}): Promise<{ subscriptions: SubscriptionDTO[]; total: number }> {
  const sp = new URLSearchParams()
  if (params?.search) sp.set("search", params.search)
  if (params?.plan_id) sp.set("plan_id", params.plan_id)
  if (params?.status) sp.set("status", params.status)
  if (params?.limit) sp.set("limit", String(params.limit))
  if (params?.offset != null) sp.set("offset", String(params.offset))
  const qs = sp.toString()
  const res = await api<ApiSuccessResponse<{ subscriptions: SubscriptionDTO[]; total: number }>>(
    `/v1/admin/billing/subscriptions${qs ? `?${qs}` : ""}`
  )
  return res.data
}

export async function updateSubscription(id: string, data: { status?: string; plan_id?: string }) {
  const res = await api<ApiSuccessResponse<{ updated: boolean }>>(
    `/v1/admin/billing/subscriptions/${id}`, { method: "PATCH", body: data }
  )
  return res.data
}

export async function getInvoices(params?: {
  search?: string; status?: string; plan_id?: string; limit?: number; offset?: number
}): Promise<{ invoices: InvoiceDTO[]; total: number }> {
  const sp = new URLSearchParams()
  if (params?.search) sp.set("search", params.search)
  if (params?.status) sp.set("status", params.status)
  if (params?.plan_id) sp.set("plan_id", params.plan_id)
  if (params?.limit) sp.set("limit", String(params.limit))
  if (params?.offset != null) sp.set("offset", String(params.offset))
  const qs = sp.toString()
  const res = await api<ApiSuccessResponse<{ invoices: InvoiceDTO[]; total: number }>>(
    `/v1/admin/billing/invoices${qs ? `?${qs}` : ""}`
  )
  return res.data
}

export async function updateInvoice(id: string, data: { status?: string; notes?: string }) {
  const res = await api<ApiSuccessResponse<{ updated: boolean }>>(
    `/v1/admin/billing/invoices/${id}`, { method: "PATCH", body: data }
  )
  return res.data
}

export async function getPlans(): Promise<{ plans: PlanDTO[] }> {
  const res = await api<ApiSuccessResponse<{ plans: PlanDTO[] }>>("/v1/admin/billing/plans")
  return res.data
}

export async function updatePlan(id: string, data: Record<string, unknown>) {
  const res = await api<ApiSuccessResponse<{ updated: boolean }>>(
    `/v1/admin/billing/plans/${id}`, { method: "PATCH", body: data }
  )
  return res.data
}

export async function createPlan(data: { name: string; description?: string; price_minor: number; max_ponds?: number | null }) {
  const res = await api<ApiSuccessResponse<PlanDTO>>("/v1/admin/billing/plans", { method: "POST", body: data })
  return res.data
}
