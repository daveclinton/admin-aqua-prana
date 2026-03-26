/* ── Forum Stats ── */
export type ForumStatsDTO = {
  active_discussions: number
  total_posts: number
  active_members: number
  flagged_content: number
}

/* ── Trending Topics ── */
export type TrendingTopicDTO = {
  id: string
  title: string
  created_at: string
  views: number
  reply_count: number
  trend: "trending" | "rising"
}

/* ── Expert Directory ── */
export type ForumExpertDTO = {
  id: string
  user_id: string | null
  name: string
  specialty: string
  experience: string | null
  rating: number | null
  rating_count: number
  status: "pending" | "verified" | "denied"
  created_at: string
}

/* ── Content Library ── */
export type ForumContentDTO = {
  id: string
  title: string
  type: "article" | "video"
  category: string | null
  category_id: string | null
  author_name: string
  views: number
  read_rate: number | null
  published_at: string | null
  status: "draft" | "published" | "archived"
  created_at: string
}

export type ContentStatsDTO = {
  total_articles: number
  total_videos: number
  total_drafts: number
  total_views: number
  avg_read_rate: number | null
}

export type ContentPerformanceDTO = {
  avg_completion_rate: number | null
  top_performing: { id: string; title: string } | null
  most_shared: { id: string; title: string } | null
  needs_update: number
  awaiting_approval: number
  views_by_category: { category: string; views: number }[]
}

export type ContentCategoryDTO = {
  id: string
  name: string
  article_count: number
  video_count: number
  total_views: number
}

/* ── Moderation ── */
export type ModerationStatsDTO = {
  pending_review: number
  actioned_today: number
  approved_this_week: number
  users_warned: number
}

export type ModerationQueueItemDTO = {
  report_id: string
  target_type: "post" | "reply" | "content"
  target_id: string
  reason: string
  report_count: number
  earliest_report_at: string
  body_excerpt: string
  author_name: string
  author_initials: string
  context: string
}

export type ModerationQueueResponse = {
  items: ModerationQueueItemDTO[]
  total: number
  counts_by_reason: Record<string, number>
}

export type ModerationActionRequest = {
  target_type: "post" | "reply" | "content"
  target_id: string
  action: "keep" | "remove" | "warn_user" | "ban_user" | "pin_correction"
  reason?: string
  correction_text?: string
}
