import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type {
  PartnerDTO,
  PartnerRow,
  PartnerDetail,
  PartnerActivity,
  PartnerCampaign,
} from "./types"
import type { DataTableQueryResult } from "@/lib/table/table-types"

/* ── Stats ── */

export type PartnerStats = {
  total_partners: number
  active_partners: number
  verified_partners: number
  activated_partners: number
  new_last_30d: number
}

export async function getPartnerStats(): Promise<PartnerStats> {
  const res = await api<ApiSuccessResponse<PartnerStats>>(
    "/v1/admin/partners/stats"
  )
  return res.data
}

/* ── List ── */

type PartnersResponse = {
  partners: PartnerDTO[]
  total: number
}

type GetPartnersParams = {
  pageIndex: number
  pageSize: number
  globalFilter: string
  accountStatus?: string
  verificationStatus?: string
  partnerStatus?: string
}

export async function getPartners(
  params: GetPartnersParams
): Promise<DataTableQueryResult<PartnerRow>> {
  const searchParams = new URLSearchParams({
    limit: String(params.pageSize),
    offset: String(params.pageIndex * params.pageSize),
  })

  if (params.globalFilter) {
    searchParams.set("search", params.globalFilter)
  }
  if (params.accountStatus) {
    searchParams.set("account_status", params.accountStatus)
  }
  if (params.verificationStatus) {
    searchParams.set("verification_status", params.verificationStatus)
  }
  if (params.partnerStatus) {
    searchParams.set("partner_status", params.partnerStatus)
  }

  const res = await api<ApiSuccessResponse<PartnersResponse>>(
    `/v1/admin/partners?${searchParams}`
  )

  const rows = res.data.partners.map(mapPartnerDTOToRow)
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

function mapPartnerDTOToRow(dto: PartnerDTO): PartnerRow {
  const fullName = [dto.first_name, dto.last_name].filter(Boolean).join(" ")
  return {
    id: dto.id,
    name: fullName || dto.name || dto.email,
    email: dto.email,
    phone: dto.phone || "-",
    category: dto.category || "-",
    partnerStatus: dto.partner_status || "pending_activation",
    location: dto.location || "-",
    campaignCount: dto.campaign_count ?? 0,
    connectedFarmers: dto.connected_farmers ?? 0,
    createdAt: dto.created_at,
  }
}

/* ── Detail ── */

export async function getPartnerDetail(id: string): Promise<PartnerDetail> {
  const res = await api<ApiSuccessResponse<PartnerDetail>>(
    `/v1/admin/partners/${id}`
  )
  return res.data
}

/* ── Activity ── */

export async function getPartnerActivity(
  partnerId: string
): Promise<PartnerActivity[]> {
  const res = await api<
    ApiSuccessResponse<{ activity: PartnerActivity[] }>
  >(`/v1/admin/partners/${partnerId}/activity`)
  return res.data.activity
}

/* ── Activate / Suspend ── */

export async function updatePartnerStatus(
  partnerId: string,
  partnerStatus: "active" | "pending_activation" | "suspended"
): Promise<PartnerDetail> {
  const res = await api<ApiSuccessResponse<PartnerDetail>>(
    `/v1/admin/partners/${partnerId}/activate`,
    {
      method: "PATCH",
      body: { partner_status: partnerStatus },
    }
  )
  return res.data
}

/* ── Edit ── */

export type UpdatePartnerData = {
  first_name?: string
  last_name?: string
  phone?: string
  organization_name?: string
  category?: string
  location?: string
  language?: string
  account_status?: string
  verification_status?: string
}

export async function updatePartner(
  partnerId: string,
  data: UpdatePartnerData
): Promise<PartnerDetail> {
  const res = await api<ApiSuccessResponse<PartnerDetail>>(
    `/v1/admin/partners/${partnerId}`,
    {
      method: "PATCH",
      body: data,
    }
  )
  return res.data
}

/* ── Create ── */

export type CreatePartnerData = {
  email: string
  first_name: string
  last_name: string
  phone?: string
  organization_name?: string
  language?: string
}

export async function createPartner(
  data: CreatePartnerData
): Promise<Record<string, unknown>> {
  const res = await api<ApiSuccessResponse<Record<string, unknown>>>(
    "/v1/admin/partners/create",
    { method: "POST", body: data }
  )
  return res.data
}

/* ── Delete ── */

export async function deletePartner(
  partnerId: string
): Promise<{ deleted: boolean }> {
  const res = await api<ApiSuccessResponse<{ deleted: boolean }>>(
    `/v1/admin/partners/${partnerId}`,
    { method: "DELETE" }
  )
  return res.data
}

/* ── Campaigns (all partners) ── */

export type CampaignListItem = PartnerCampaign & {
  partner_id: string
  partner_name: string
}

type CampaignsResponse = {
  campaigns: CampaignListItem[]
  total: number
}

type GetCampaignsParams = {
  pageIndex: number
  pageSize: number
  globalFilter: string
  status?: string
}

export async function getCampaigns(
  params: GetCampaignsParams
): Promise<{ campaigns: CampaignListItem[]; total: number }> {
  const searchParams = new URLSearchParams({
    limit: String(params.pageSize),
    offset: String(params.pageIndex * params.pageSize),
  })
  if (params.globalFilter) searchParams.set("search", params.globalFilter)
  if (params.status) searchParams.set("status", params.status)

  const res = await api<ApiSuccessResponse<CampaignsResponse>>(
    `/v1/admin/campaigns?${searchParams}`
  )
  return res.data
}

/* ── Campaign CRUD ── */

export type CreateCampaignData = {
  partner_id: string
  title: string
  starts_at?: string
  ends_at?: string
  connected_farmers_target?: number
  budget_minor?: number
  currency?: string
}

export async function createCampaign(
  data: CreateCampaignData
): Promise<PartnerCampaign> {
  const res = await api<ApiSuccessResponse<PartnerCampaign>>(
    "/v1/admin/campaigns",
    { method: "POST", body: data }
  )
  return res.data
}

export async function deleteCampaign(
  campaignId: string
): Promise<{ deleted: boolean }> {
  const res = await api<ApiSuccessResponse<{ deleted: boolean }>>(
    `/v1/admin/campaigns/${campaignId}`,
    { method: "DELETE" }
  )
  return res.data
}
