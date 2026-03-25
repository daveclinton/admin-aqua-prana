export type TeamMemberStatus = "active" | "pending" | "invited" | "suspended"
export type TeamRole = "super_admin" | "agent" | "read_only"

export type TeamMemberDTO = {
  id: string
  email: string
  name: string | null
  image: string | null
  created_at: string
  account_status: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  two_factor_enabled: boolean
  team_role: TeamRole
  title: string | null
  team_status: TeamMemberStatus
  last_active_at: string | null
  screens: string[]
}

export type TeamStatsDTO = {
  total: number
  super_admins: number
  agents: number
  read_only: number
  pending_invites: number
}

export type RolePermissionDTO = {
  role: string
  permission: string
  granted: boolean
}

export type RoleScreenDTO = {
  role: string
  screen: string
  granted: boolean
}

export type RolesConfigDTO = {
  permissions: RolePermissionDTO[]
  screens: RoleScreenDTO[]
}

export type InviteMemberRequest = {
  email: string
  name: string
  team_role?: TeamRole
  title?: string
  screens?: string[]
}

export type UpdateMemberRequest = {
  team_role?: TeamRole
  title?: string
  status?: TeamMemberStatus
  screens?: string[]
}

// Keep legacy types for backward compatibility with old table client
export type TeamMemberRole = "Super Admin" | "Support Lead" | "Field Ops" | "Finance"

export type AdminTeamMemberDTO = {
  user_id: string
  full_name: string
  work_email: string
  region_name: string
  access_role: TeamMemberRole
  status: TeamMemberStatus
  open_tickets: number
  last_active_at: string
}

export type TeamMemberRow = {
  id: string
  name: string
  email: string
  region: string
  role: TeamMemberRole
  status: TeamMemberStatus
  ticketsAssigned: number
  lastActiveAt: string
}
