export type OverviewStatsDTO = {
  total_ponds: number
  total_farmers: number
  total_revenue: number
  new_farmers_7d: number
  new_ponds_7d: number
  revenue_7d: number
}

export type PondAnalyticsDTO = {
  overview: {
    total_ponds: number
    avg_pondscore: number | null
  }
  regions: RegionDTO[]
  health_distribution: HealthBucketDTO[]
  species: SpeciesDTO[]
  growth_cohorts: GrowthCohortDTO[]
}

export type RegionDTO = {
  region: string
  farmers: number
  ponds: number
  avg_pondscore: number | null
  alert_rate: number
}

export type HealthBucketDTO = {
  range: string
  count: number
}

export type SpeciesDTO = {
  species: string
  ponds: number
  avg_pondscore: number | null
  alert_frequency: string
}

export type GrowthCohortDTO = {
  month: string
  signups: number
  churned: number
}

export type AquagptAnalyticsDTO = {
  summary: {
    total_chats: number
    chats_in_range: number
    unique_users: number
    unique_users_in_range: number
    total_tokens: number
    tokens_in_range: number
    avg_latency_ms: number
    total_errors: number
    chats_today: number
    chats_this_week: number
    resolutions: number
    escalated_count: number
  }
  daily_usage: { date: string; chats: number; unique_users: number; tokens: number }[]
}

export type MarketplaceAnalyticsDTO = {
  summary: {
    total_products: number
    active_products: number
    total_orders: number
    orders_in_range: number
    total_revenue: number
    revenue_in_range: number
  }
}

export type UserAnalyticsDTO = {
  summary: {
    total_users: number
    farmers: number
    partners: number
    new_in_range: number
  }
  daily_signups: { date: string; signups: number }[]
}
