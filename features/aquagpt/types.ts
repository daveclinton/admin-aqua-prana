export type UsageLogDTO = {
  id: string
  user_id: string
  user_email: string | null
  user_name: string | null
  conversation_id: string | null
  model: string
  user_message: string
  assistant_message: string | null
  status: string
  error_message: string | null
  prompt_tokens: number | null
  completion_tokens: number | null
  total_tokens: number | null
  latency_ms: number | null
  created_at: string
}

export type UsageLogRow = {
  id: string
  userName: string
  userEmail: string
  userMessage: string
  model: string
  totalTokens: number | null
  latencyMs: number | null
  status: string
  createdAt: string
}

export type UsageSummary = {
  total_requests: number
  success_count: number
  error_count: number
  avg_latency_ms: number
  total_tokens_used: number
}

export type AquagptAnalyticsSummary = {
  total_chats: number
  chats_in_range: number
  unique_users: number
  unique_users_in_range: number
  total_tokens: number
  tokens_in_range: number
  avg_latency_ms: number
  total_errors: number
}

export type AquagptDailyPoint = {
  date: string
  chats: number
  unique_users: number
  tokens: number
}

export type AquagptAnalytics = {
  summary: AquagptAnalyticsSummary
  daily: AquagptDailyPoint[]
}
