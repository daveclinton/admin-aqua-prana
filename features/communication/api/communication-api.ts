import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type { CommStatsDTO, BroadcastDTO, SmsCampaignDTO, SuppressionDTO } from "@/features/communication/types"

export async function getCommStats(): Promise<CommStatsDTO> {
  const res = await api<ApiSuccessResponse<CommStatsDTO>>("/v1/admin/communication/stats")
  return res.data
}

export async function sendBroadcast(data: {
  title: string; body: string; category?: string; severity?: string; target_role?: string
}): Promise<{ batch_id: string; recipients: number }> {
  const res = await api<ApiSuccessResponse<{ batch_id: string; recipients: number }>>(
    "/v1/admin/notifications/broadcast", { method: "POST", body: data }
  )
  return res.data
}

export async function getBroadcastHistory(params?: {
  search?: string; limit?: number; offset?: number
}): Promise<{ broadcasts: BroadcastDTO[]; total: number }> {
  const sp = new URLSearchParams()
  if (params?.search) sp.set("search", params.search)
  if (params?.limit) sp.set("limit", String(params.limit))
  if (params?.offset != null) sp.set("offset", String(params.offset))
  const qs = sp.toString()
  const res = await api<ApiSuccessResponse<{ broadcasts: BroadcastDTO[]; total: number }>>(
    `/v1/admin/notifications/history${qs ? `?${qs}` : ""}`
  )
  return res.data
}

export async function getSmsCampaigns(params?: {
  status?: string; limit?: number; offset?: number
}): Promise<{ campaigns: SmsCampaignDTO[]; total: number }> {
  const sp = new URLSearchParams()
  if (params?.status) sp.set("status", params.status)
  if (params?.limit) sp.set("limit", String(params.limit))
  if (params?.offset != null) sp.set("offset", String(params.offset))
  const qs = sp.toString()
  const res = await api<ApiSuccessResponse<{ campaigns: SmsCampaignDTO[]; total: number }>>(
    `/v1/admin/communication/sms-campaigns${qs ? `?${qs}` : ""}`
  )
  return res.data
}

export async function createSmsCampaign(data: {
  title: string; body: string; audience?: string; scheduled_for?: string
}) {
  const res = await api<ApiSuccessResponse<SmsCampaignDTO>>(
    "/v1/admin/communication/sms-campaigns", { method: "POST", body: data }
  )
  return res.data
}

export async function updateSmsCampaign(id: string, data: { status?: string; title?: string; body?: string }) {
  const res = await api<ApiSuccessResponse<{ updated: boolean }>>(
    `/v1/admin/communication/sms-campaigns/${id}`, { method: "PATCH", body: data }
  )
  return res.data
}

export async function getSuppressionList(params?: {
  channel?: string; limit?: number; offset?: number
}): Promise<{ suppressions: SuppressionDTO[]; total: number }> {
  const sp = new URLSearchParams()
  if (params?.channel) sp.set("channel", params.channel)
  if (params?.limit) sp.set("limit", String(params.limit))
  if (params?.offset != null) sp.set("offset", String(params.offset))
  const qs = sp.toString()
  const res = await api<ApiSuccessResponse<{ suppressions: SuppressionDTO[]; total: number }>>(
    `/v1/admin/communication/suppressions${qs ? `?${qs}` : ""}`
  )
  return res.data
}

export async function removeSuppression(id: string) {
  const res = await api<ApiSuccessResponse<{ removed: boolean }>>(
    "/v1/admin/communication/suppressions", { method: "DELETE", body: { id } }
  )
  return res.data
}
