export type SubscriptionStatsDTO = {
  mrr_minor: number
  active_paid: number
  overdue: number
  suspended: number
  free_tier: number
}

export type InvoiceStatsDTO = {
  collected_this_month: number
  outstanding: number
  overdue_count: number
  write_offs: number
  total_invoices: number
}

export type SubscriptionDTO = {
  id: string
  status: string
  starts_at: string | null
  ends_at: string | null
  cancelled_at: string | null
  created_at: string
  user_id: string
  farmer_name: string | null
  farmer_email: string
  plan_id: string
  plan_name: string
  price_minor: number
  currency: string
  billing_period: string
}

export type InvoiceDTO = {
  id: string
  amount_minor: number
  currency: string
  status: string
  period_start: string | null
  period_end: string | null
  issued_at: string
  due_at: string | null
  paid_at: string | null
  payment_method: string | null
  notes: string | null
  user_id: string
  farmer_name: string | null
  farmer_email: string
  plan_id: string | null
  plan_name: string | null
}

export type PlanDTO = {
  id: string
  name: string
  description: string | null
  price_minor: number
  currency: string
  billing_period: string
  max_ponds: number | null
  features: string | null
  is_active: boolean
  sort_order: number
  active_subscribers: number
}
