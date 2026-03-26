import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type {
  TeamMemberDTO,
  TeamStatsDTO,
  RolesConfigDTO,
  InviteMemberRequest,
  UpdateMemberRequest,
} from "@/features/team/types"

type TeamListResponse = { members: TeamMemberDTO[]; total: number }

export async function getTeamMembersList(params: {
  search?: string
  limit?: number
  offset?: number
}): Promise<TeamListResponse> {
  const sp = new URLSearchParams()
  if (params.search) sp.set("search", params.search)
  if (params.limit) sp.set("limit", String(params.limit))
  if (params.offset != null) sp.set("offset", String(params.offset))
  const qs = sp.toString()
  const res = await api<ApiSuccessResponse<TeamListResponse>>(
    `/v1/admin/team${qs ? `?${qs}` : ""}`
  )
  return res.data
}

export async function getTeamStatsApi(): Promise<TeamStatsDTO> {
  const res = await api<ApiSuccessResponse<TeamStatsDTO>>(
    "/v1/admin/team/stats"
  )
  return res.data
}

export async function inviteMember(
  data: InviteMemberRequest
): Promise<{ invited?: boolean; promoted?: boolean; user_id: string }> {
  const res = await api<
    ApiSuccessResponse<{ invited?: boolean; promoted?: boolean; user_id: string }>
  >("/v1/admin/team/invite", { method: "POST", body: data })
  return res.data
}

export async function updateMember(
  memberId: string,
  data: UpdateMemberRequest
): Promise<{ updated: boolean }> {
  const res = await api<ApiSuccessResponse<{ updated: boolean }>>(
    `/v1/admin/team/${memberId}`,
    { method: "PATCH", body: data }
  )
  return res.data
}

export async function removeMember(
  memberId: string
): Promise<{ removed: boolean }> {
  const res = await api<ApiSuccessResponse<{ removed: boolean }>>(
    `/v1/admin/team/${memberId}`,
    { method: "DELETE" }
  )
  return res.data
}

export async function resendInvite(
  memberId: string
): Promise<{ resent: boolean; email: string }> {
  const res = await api<ApiSuccessResponse<{ resent: boolean; email: string }>>(
    `/v1/admin/team/${memberId}/resend`,
    { method: "POST" }
  )
  return res.data
}

export async function getRolesConfig(): Promise<RolesConfigDTO> {
  const res = await api<ApiSuccessResponse<RolesConfigDTO>>(
    "/v1/admin/team/roles"
  )
  return res.data
}

export async function updateRoleConfig(data: {
  type: "permission" | "screen"
  role: string
  permission?: string
  screen?: string
  granted: boolean
}): Promise<{ updated: boolean }> {
  const res = await api<ApiSuccessResponse<{ updated: boolean }>>(
    "/v1/admin/team/roles",
    { method: "PUT", body: data }
  )
  return res.data
}
