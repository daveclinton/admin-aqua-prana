import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type {
  TicketDTO,
  SupportStatsDTO,
  AgentWorkloadDTO,
  DataRequestDTO,
  CreateTicketRequest,
} from "@/features/support/types"

export async function getTickets(params?: {
  search?: string
  priority?: string
  status?: string
  assigned_to?: string
  limit?: number
  offset?: number
}): Promise<{ tickets: TicketDTO[]; total: number }> {
  const sp = new URLSearchParams()
  if (params?.search) sp.set("search", params.search)
  if (params?.priority) sp.set("priority", params.priority)
  if (params?.status) sp.set("status", params.status)
  if (params?.assigned_to) sp.set("assigned_to", params.assigned_to)
  if (params?.limit) sp.set("limit", String(params.limit))
  if (params?.offset != null) sp.set("offset", String(params.offset))
  const qs = sp.toString()
  const res = await api<ApiSuccessResponse<{ tickets: TicketDTO[]; total: number }>>(
    `/v1/admin/support/tickets${qs ? `?${qs}` : ""}`
  )
  return res.data
}

export async function createTicket(data: CreateTicketRequest) {
  const res = await api<ApiSuccessResponse<TicketDTO>>("/v1/admin/support/tickets", {
    method: "POST",
    body: data,
  })
  return res.data
}

export async function updateTicket(id: string, data: { status?: string; priority?: string; assigned_to?: string | null }) {
  const res = await api<ApiSuccessResponse<{ updated: boolean }>>(
    `/v1/admin/support/tickets/${id}`,
    { method: "PATCH", body: data }
  )
  return res.data
}

export async function getSupportStats(): Promise<SupportStatsDTO> {
  const res = await api<ApiSuccessResponse<SupportStatsDTO>>("/v1/admin/support/stats")
  return res.data
}

export async function getAgentWorkload(): Promise<{ agents: AgentWorkloadDTO[] }> {
  const res = await api<ApiSuccessResponse<{ agents: AgentWorkloadDTO[] }>>("/v1/admin/support/agents")
  return res.data
}

export async function getDataRequests(params?: {
  status?: string
  limit?: number
  offset?: number
}): Promise<{ requests: DataRequestDTO[]; total: number }> {
  const sp = new URLSearchParams()
  if (params?.status) sp.set("status", params.status)
  if (params?.limit) sp.set("limit", String(params.limit))
  if (params?.offset != null) sp.set("offset", String(params.offset))
  const qs = sp.toString()
  const res = await api<ApiSuccessResponse<{ requests: DataRequestDTO[]; total: number }>>(
    `/v1/admin/support/data-requests${qs ? `?${qs}` : ""}`
  )
  return res.data
}

export async function updateDataRequest(id: string, data: { status: string }) {
  const res = await api<ApiSuccessResponse<{ updated: boolean }>>(
    `/v1/admin/support/data-requests/${id}`,
    { method: "PATCH", body: data }
  )
  return res.data
}
