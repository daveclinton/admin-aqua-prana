import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type { PassbookEntryDTO, PassbookEntryRow } from "./types"
import type { DataTableQueryResult } from "@/lib/table/table-types"

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
