import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type { PartnerDTO, PartnerRow } from "./types"
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
    organization: dto.organization_name || "-",
    phone: dto.phone || "-",
    accountStatus: dto.account_status ?? "active",
    verificationStatus: dto.verification_status ?? "unverified",
    partnerStatus: dto.partner_status || "pending_activation",
    createdAt: dto.created_at,
  }
}
