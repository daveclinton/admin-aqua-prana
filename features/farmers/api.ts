import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type {
  FarmerDTO,
  FarmerRow,
  FarmerDetail,
  FarmerPond,
  FarmerPassbookEntry,
  FarmerActivity,
} from "./types"
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
    region: dto.organization_name || "-",
    plan: "Standard",
    species: dto.species || "-",
    pondCount: dto.pond_count ?? 0,
    avgPondScore: "-",
    alertCount: dto.alert_count ?? 0,
    lastLogin: dto.last_login
      ? new Date(dto.last_login).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Never",
    accountStatus: dto.account_status ?? "active",
  }
}

/* ── Create ── */

export type CreateFarmerData = {
  email: string
  first_name: string
  last_name: string
  phone?: string
  organization_name?: string
  language?: string
}

export async function createFarmer(
  data: CreateFarmerData
): Promise<Record<string, unknown>> {
  const res = await api<ApiSuccessResponse<Record<string, unknown>>>(
    "/v1/admin/farmers/create",
    { method: "POST", body: data }
  )
  return res.data
}

/* ── Detail ── */

export async function getFarmerDetail(id: string): Promise<FarmerDetail> {
  const res = await api<ApiSuccessResponse<FarmerDetail>>(
    `/v1/admin/farmers/${id}`
  )
  return res.data
}

/* ── Ponds ── */

export async function getFarmerPonds(farmerId: string): Promise<FarmerPond[]> {
  const res = await api<ApiSuccessResponse<{ ponds: FarmerPond[] }>>(
    `/v1/admin/farmers/${farmerId}/ponds`
  )
  return res.data.ponds
}

/* ── Passbook ── */

export async function getFarmerPassbook(
  farmerId: string
): Promise<FarmerPassbookEntry[]> {
  const res = await api<
    ApiSuccessResponse<{ entries: FarmerPassbookEntry[] }>
  >(`/v1/admin/farmers/${farmerId}/passbook`)
  return res.data.entries
}

/* ── Activity ── */

export async function getFarmerActivity(
  farmerId: string
): Promise<FarmerActivity[]> {
  const res = await api<
    ApiSuccessResponse<{ activity: FarmerActivity[] }>
  >(`/v1/admin/farmers/${farmerId}/activity`)
  return res.data.activity
}

/* ── Edit ── */

export type UpdateFarmerData = {
  account_status?: "active" | "suspended" | "archived"
  verification_status?: "unverified" | "pending_review" | "verified" | "rejected"
  role?: string
  first_name?: string
  last_name?: string
  phone?: string
  organization_name?: string
  language?: string
}

export async function updateFarmer(
  farmerId: string,
  data: UpdateFarmerData
): Promise<FarmerDetail> {
  const res = await api<ApiSuccessResponse<FarmerDetail>>(
    `/v1/admin/farmers/${farmerId}`,
    {
      method: "PATCH",
      body: data,
    }
  )
  return res.data
}

/* ── Delete ── */

export async function deleteFarmer(
  farmerId: string
): Promise<{ deleted: boolean }> {
  const res = await api<ApiSuccessResponse<{ deleted: boolean }>>(
    `/v1/admin/farmers/${farmerId}`,
    { method: "DELETE" }
  )
  return res.data
}

/* ── Create Pond ── */

export type CreatePondData = {
  name: string
  area?: number
  area_unit?: string
  depth?: number
  latitude?: number
  longitude?: number
  status?: "active" | "inactive" | "archived"
}

export async function createPond(
  farmerId: string,
  data: CreatePondData
): Promise<FarmerPond> {
  const res = await api<ApiSuccessResponse<FarmerPond>>(
    `/v1/admin/farmers/${farmerId}/ponds`,
    { method: "POST", body: data }
  )
  return res.data
}

/* ── Delete Pond ── */

export async function deletePond(
  farmerId: string,
  pondId: string
): Promise<{ deleted: boolean }> {
  const res = await api<ApiSuccessResponse<{ deleted: boolean }>>(
    `/v1/admin/farmers/${farmerId}/ponds?pond_id=${pondId}`,
    { method: "DELETE" }
  )
  return res.data
}
