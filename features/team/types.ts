export type TeamMemberStatus = "active" | "pending" | "invited"
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
