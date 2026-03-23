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
  // Trend comparisons
  new_ponds_7d: number
  new_ponds_prev_7d: number
  new_farmers_7d: number
  new_farmers_prev_7d: number
  new_partners_7d: number
  new_partners_prev_7d: number
  revenue_7d: number
  revenue_prev_7d: number
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
  db_latency_ms: number
  total_users: number
  active_sessions: number
  aquagpt_error_rate_24h: number
  aquagpt_requests_24h: number
  audit_events_24h: number
  server_uptime_hours: number
  api_status: string
  api_success_rate_24h: number
}
