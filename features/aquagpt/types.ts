/* ── Legacy usage log types (kept for usage-logs-table) ── */

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

/* ── Updated analytics summary ── */

export type AquagptAnalyticsSummary = {
  total_chats: number
  chats_in_range: number
  chats_today: number
  chats_this_week: number
  resolutions: number
  escalated_count: number
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

/* ── Accuracy trend ── */

export type AccuracyPoint = {
  label: string
  accuracy: number
}

export type AccuracyTrend = {
  points: AccuracyPoint[]
  change_pct: number
}

/* ── Model & Training status ── */

export type ModelStatus = {
  version: string
  status: "live" | "training" | "degraded"
  training_progress: number
  escalated_queries: number
  unanswered_today: number
  human_handoffs: number
}

/* ── Chats table ── */

export type ChatDTO = {
  id: string
  user_id: string
  user_name: string | null
  conversation_id: string
  topic: string | null
  message_count: number
  last_active: string
  accuracy: number | null
  rating: number | null
  escalated: boolean
}

export type ChatRow = {
  id: string
  userId: string
  chatId: string
  topic: string
  messages: number
  lastActive: string
  accuracy: number | null
  rating: number | null
  escalated: boolean
}

/* ── Topic clustering ── */

export type TopicCluster = {
  topic: string
  query_count: number
  color: string
}

export type TopicInsight = {
  id: string
  type: "knowledge_gap" | "trending_topic"
  title: string
  description: string
  action_label: string
  action_href: string
}

export type TopicClusteringData = {
  topics: TopicCluster[]
  insights: TopicInsight[]
}
