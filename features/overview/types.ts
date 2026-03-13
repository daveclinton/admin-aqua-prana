export interface OverviewStats {
  total_users: number
  new_users_7d: number
  active_users: number
  pending_verifications: number
  total_orders: number
  total_revenue: number
  active_products: number
  active_forum_posts: number
  chats_7d: number
  audit_events_24h: number
  total_ponds: number
  total_farmers: number
  total_partners: number
}

export interface TrendPoint {
  date: string
  count: number
  revenue?: number
}

export interface OverviewTrends {
  signups: TrendPoint[]
  orders: (TrendPoint & { revenue: number })[]
  chats: TrendPoint[]
}

export interface OverviewAlert {
  type: string
  message: string
  severity: "critical" | "warning" | "info"
}

export interface ActivityItem {
  id: string
  action: string
  email: string | null
  user_name: string | null
  success: boolean
  ip_address: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface SystemHealth {
  database: string
  total_users: number
  active_sessions: number
  aquagpt_error_rate_24h: number
  aquagpt_requests_24h: number
  audit_events_24h: number
}
