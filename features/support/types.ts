export type TicketPriority = "critical" | "high" | "medium" | "low"
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed" | "returned"

export type TicketDTO = {
  id: string
  subject: string
  priority: TicketPriority
  status: TicketStatus
  assigned_to: string | null
  agent_name: string | null
  sla_deadline: string | null
  created_at: string
  resolved_at: string | null
  first_response_at: string | null
  csat_rating: number | null
  farmer_id: string | null
}

export type SupportStatsDTO = {
  critical: number
  high: number
  medium: number
  low: number
  csat_avg: number | null
  sla_compliance: number
  avg_response_hrs: number | null
  avg_resolution_hrs: number | null
}

export type AgentWorkloadDTO = {
  agent_id: string
  agent_name: string
  open_tickets: number
  total_assigned: number
  sla_compliance: number
}

export type DataRequestDTO = {
  id: string
  farmer_id: string
  farmer_name: string
  farmer_email: string
  type: string
  status: string
  created_at: string
  reviewed_at: string | null
}

export type CreateTicketRequest = {
  subject: string
  description?: string
  priority?: TicketPriority
  assigned_to?: string
  farmer_id?: string
  sla_hours?: number
}
