import type { SortingState } from "@tanstack/react-table"
import { teamMembersDataset } from "@/features/team/mocks/faker-team-members"
import type {
  AdminTeamMemberDTO,
  TeamMemberRow,
} from "@/features/team/types"
import type { DataTableQueryResult } from "@/lib/table/table-types"

type GetTeamMembersParams = {
  pageIndex: number
  pageSize: number
  globalFilter: string
  sorting: SortingState
}

export async function getTeamMembers(
  params: GetTeamMembersParams
): Promise<DataTableQueryResult<TeamMemberRow>> {
  await new Promise((resolve) => setTimeout(resolve, 250))

  const rows = teamMembersDataset.map(mapAdminTeamMemberToRow)
  const filteredRows = filterRows(rows, params.globalFilter)
  const sortedRows = sortRows(filteredRows, params.sorting)
  const start = params.pageIndex * params.pageSize
  const end = start + params.pageSize
  const paginatedRows = sortedRows.slice(start, end)

  return {
    rows: paginatedRows,
    rowCount: sortedRows.length,
    pageCount: Math.max(1, Math.ceil(sortedRows.length / params.pageSize)),
  }
}

export function mapAdminTeamMemberToRow(
  dto: AdminTeamMemberDTO
): TeamMemberRow {
  return {
    id: dto.user_id,
    name: dto.full_name,
    email: dto.work_email,
    region: dto.region_name,
    role: dto.access_role,
    status: dto.status,
    ticketsAssigned: dto.open_tickets,
    lastActiveAt: dto.last_active_at,
  }
}

function filterRows(rows: TeamMemberRow[], globalFilter: string) {
  const normalizedFilter = globalFilter.trim().toLowerCase()

  if (!normalizedFilter) {
    return rows
  }

  return rows.filter((row) =>
    [row.name, row.email, row.region, row.role, row.status]
      .join(" ")
      .toLowerCase()
      .includes(normalizedFilter)
  )
}

function sortRows(rows: TeamMemberRow[], sorting: SortingState) {
  const [activeSort] = sorting

  if (!activeSort) {
    return [...rows].sort(
      (left, right) =>
        new Date(right.lastActiveAt).getTime() -
        new Date(left.lastActiveAt).getTime()
    )
  }

  return [...rows].sort((left, right) => {
    const leftValue = left[activeSort.id as keyof TeamMemberRow]
    const rightValue = right[activeSort.id as keyof TeamMemberRow]

    if (leftValue === rightValue) {
      return 0
    }

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return activeSort.desc ? rightValue - leftValue : leftValue - rightValue
    }

    if (activeSort.id === "lastActiveAt") {
      return activeSort.desc
        ? new Date(String(rightValue)).getTime() -
            new Date(String(leftValue)).getTime()
        : new Date(String(leftValue)).getTime() -
            new Date(String(rightValue)).getTime()
    }

    const comparison = String(leftValue).localeCompare(String(rightValue))
    return activeSort.desc ? comparison * -1 : comparison
  })
}
