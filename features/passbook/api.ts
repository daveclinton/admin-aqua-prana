import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type { PassbookEntryDTO, PassbookEntryRow } from "./types"
import type { DataTableQueryResult } from "@/lib/table/table-types"

/* ── Stats ── */

export type PassbookStats = {
  total_entries: number
  total_credits: number
  total_debits: number
  unique_farmers: number
  unique_ponds: number
}

export type PassbookMonitoringSummary = {
  overview: {
    total_ponds: number
    mapped_ponds: number
    total_unresolved_alerts: number
    critical_alerts: number
    avg_overall_score: number
    critical_score_ponds: number
    low_confidence_ponds: number
    recent_passbook_entries: number
    mortality_reports_24h: number
  }
  parameter_alerts: Array<{
    parameter: string
    label: string
    total: number
    critical: number
    warning: number
  }>
  score_bands: {
    excellent: number
    good: number
    fair: number
    poor: number
    critical: number
    unknown: number
  }
  regional_breakdown: Array<{
    region: string
    pond_count: number
    active_alerts: number
    critical_alerts: number
    healthy_ponds: number
    avg_score: number
  }>
  map_points: Array<{
    id: string
    name: string
    latitude: number
    longitude: number
    region: string
    overall: number | null
    confidence: number | null
    band: string
    active_alerts: number
    critical_alerts: number
  }>
  missing_data: Array<{
    parameter: string
    label: string
    count: number
  }>
  irregular_flags: {
    data_gaps: number
    critical_score_ponds: number
    low_confidence_ponds: number
    mortality_reports_24h: number
  }
  generated_at: string
}

export async function getPassbookStats(): Promise<PassbookStats> {
  const res = await api<ApiSuccessResponse<PassbookStats>>(
    "/v1/admin/passbook/stats"
  )
  return res.data
}

export async function getPassbookMonitoringSummary(): Promise<PassbookMonitoringSummary> {
  const res = await api<ApiSuccessResponse<PassbookMonitoringSummary>>(
    "/v1/admin/passbook/monitoring"
  )
  return res.data
}

/* ── List ── */

type PassbookResponse = {
  entries: PassbookEntryDTO[]
  total: number
}

type GetPassbookParams = {
  pageIndex: number
  pageSize: number
  globalFilter: string
  type?: string
}

export async function getPassbookEntries(
  params: GetPassbookParams
): Promise<DataTableQueryResult<PassbookEntryRow>> {
  const searchParams = new URLSearchParams({
    limit: String(params.pageSize),
    offset: String(params.pageIndex * params.pageSize),
  })

  if (params.globalFilter) {
    searchParams.set("search", params.globalFilter)
  }
  if (params.type) {
    searchParams.set("type", params.type)
  }

  const res = await api<ApiSuccessResponse<PassbookResponse>>(
    `/v1/admin/passbook?${searchParams}`
  )

  const rows = res.data.entries.map(mapEntryDTOToRow)
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

function mapEntryDTOToRow(dto: PassbookEntryDTO): PassbookEntryRow {
  const fullName = [dto.first_name, dto.last_name].filter(Boolean).join(" ")
  return {
    id: dto.id,
    type: dto.type,
    description: dto.description,
    pond: dto.pond || "-",
    amount: dto.amount,
    isCredit: dto.is_credit,
    userName: fullName || dto.user_name || dto.user_email,
    userEmail: dto.user_email,
    entryDate: dto.entry_date,
  }
}
