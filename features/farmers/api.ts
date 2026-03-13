import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type { FarmerDTO, FarmerRow } from "./types"
import type { DataTableQueryResult } from "@/lib/table/table-types"

/* ── Stats ── */

export type FarmerStats = {
  total_farmers: number
  active_farmers: number
  verified_farmers: number
  new_last_30d: number
  total_ponds: number
  active_ponds: number
}

export async function getFarmerStats(): Promise<FarmerStats> {
  const res = await api<ApiSuccessResponse<FarmerStats>>(
    "/v1/admin/farmers/stats"
  )
  return res.data
}

/* ── List ── */

type FarmersResponse = {
  users: FarmerDTO[]
  total: number
}

type GetFarmersParams = {
  pageIndex: number
  pageSize: number
  globalFilter: string
  accountStatus?: string
  verificationStatus?: string
}

export async function getFarmers(
  params: GetFarmersParams
): Promise<DataTableQueryResult<FarmerRow>> {
  const searchParams = new URLSearchParams({
    role: "farmer",
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

  const res = await api<ApiSuccessResponse<FarmersResponse>>(
    `/v1/admin/users?${searchParams}`
  )

  const rows = res.data.users.map(mapFarmerDTOToRow)
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

function mapFarmerDTOToRow(dto: FarmerDTO): FarmerRow {
  const fullName = [dto.first_name, dto.last_name].filter(Boolean).join(" ")
  return {
    id: dto.id,
    name: fullName || dto.name || dto.email,
    email: dto.email,
    phone: dto.phone || "-",
    accountStatus: dto.account_status ?? "active",
    verificationStatus: dto.verification_status ?? "unverified",
    createdAt: dto.created_at,
  }
}
