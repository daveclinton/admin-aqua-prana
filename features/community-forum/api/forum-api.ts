import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type {
  ForumStatsDTO,
  TrendingTopicDTO,
  ForumExpertDTO,
  ForumContentDTO,
  ContentStatsDTO,
  ContentPerformanceDTO,
  ContentCategoryDTO,
  ModerationStatsDTO,
  ModerationQueueResponse,
  ModerationActionRequest,
} from "@/features/community-forum/types"

/* ── Stats & Trending ── */

export async function getForumStats(): Promise<ForumStatsDTO> {
  const res = await api<ApiSuccessResponse<ForumStatsDTO>>("/v1/admin/forum/stats")
  return res.data
}

export async function getTrendingTopics(limit = 5): Promise<{ topics: TrendingTopicDTO[] }> {
  const res = await api<ApiSuccessResponse<{ topics: TrendingTopicDTO[] }>>(
    `/v1/admin/forum/trending?limit=${limit}`
  )
  return res.data
}

export async function pinPost(postId: string, pinned: boolean) {
  const res = await api<ApiSuccessResponse<{ updated: boolean }>>(
    `/v1/admin/forum/posts/${postId}/pin`,
    { method: "PATCH", body: { pinned } }
  )
  return res.data
}

/* ── Experts ── */

export async function getExperts(params?: {
  search?: string
  status?: string
  limit?: number
  offset?: number
}): Promise<{ experts: ForumExpertDTO[]; total: number }> {
  const sp = new URLSearchParams()
  if (params?.search) sp.set("search", params.search)
  if (params?.status) sp.set("status", params.status)
  if (params?.limit) sp.set("limit", String(params.limit))
  if (params?.offset != null) sp.set("offset", String(params.offset))
  const qs = sp.toString()
  const res = await api<ApiSuccessResponse<{ experts: ForumExpertDTO[]; total: number }>>(
    `/v1/admin/forum/experts${qs ? `?${qs}` : ""}`
  )
  return res.data
}

export async function createExpert(data: { name: string; specialty: string; experience?: string }) {
  const res = await api<ApiSuccessResponse<ForumExpertDTO>>("/v1/admin/forum/experts", {
    method: "POST",
    body: data,
  })
  return res.data
}

export async function updateExpert(id: string, data: { status?: string; specialty?: string }) {
  const res = await api<ApiSuccessResponse<{ updated: boolean }>>(
    `/v1/admin/forum/experts/${id}`,
    { method: "PATCH", body: data }
  )
  return res.data
}

/* ── Content Library ── */

export async function getContentList(params?: {
  search?: string
  type?: string
  category_id?: string
  status?: string
  limit?: number
  offset?: number
}): Promise<{ items: ForumContentDTO[]; total: number }> {
  const sp = new URLSearchParams()
  if (params?.search) sp.set("search", params.search)
  if (params?.type) sp.set("type", params.type)
  if (params?.category_id) sp.set("category_id", params.category_id)
  if (params?.status) sp.set("status", params.status)
  if (params?.limit) sp.set("limit", String(params.limit))
  if (params?.offset != null) sp.set("offset", String(params.offset))
  const qs = sp.toString()
  const res = await api<ApiSuccessResponse<{ items: ForumContentDTO[]; total: number }>>(
    `/v1/admin/forum/content${qs ? `?${qs}` : ""}`
  )
  return res.data
}

export async function createContent(data: {
  title: string
  body?: string
  type: "article" | "video"
  category_id?: string
  status?: "draft" | "published"
}) {
  const res = await api<ApiSuccessResponse<ForumContentDTO>>("/v1/admin/forum/content", {
    method: "POST",
    body: data,
  })
  return res.data
}

export async function updateContent(id: string, data: { title?: string; status?: string; category_id?: string }) {
  const res = await api<ApiSuccessResponse<{ updated: boolean }>>(
    `/v1/admin/forum/content/${id}`,
    { method: "PATCH", body: data }
  )
  return res.data
}

export async function getContentStats(): Promise<ContentStatsDTO> {
  const res = await api<ApiSuccessResponse<ContentStatsDTO>>("/v1/admin/forum/content/stats")
  return res.data
}

export async function getContentPerformance(): Promise<ContentPerformanceDTO> {
  const res = await api<ApiSuccessResponse<ContentPerformanceDTO>>("/v1/admin/forum/content/performance")
  return res.data
}

/* ── Categories ── */

export async function getContentCategories(): Promise<{ categories: ContentCategoryDTO[] }> {
  const res = await api<ApiSuccessResponse<{ categories: ContentCategoryDTO[] }>>(
    "/v1/admin/forum/content/categories"
  )
  return res.data
}

export async function createCategory(data: { name: string }) {
  const res = await api<ApiSuccessResponse<ContentCategoryDTO>>("/v1/admin/forum/content/categories", {
    method: "POST",
    body: data,
  })
  return res.data
}

export async function updateCategory(id: string, data: { name: string }) {
  const res = await api<ApiSuccessResponse<{ updated: boolean }>>(
    `/v1/admin/forum/content/categories/${id}`,
    { method: "PATCH", body: data }
  )
  return res.data
}

/* ── Moderation ── */

export async function getModerationStats(): Promise<ModerationStatsDTO> {
  const res = await api<ApiSuccessResponse<ModerationStatsDTO>>("/v1/admin/forum/moderation/stats")
  return res.data
}

export async function getModerationQueue(params?: {
  reason?: string
  target_type?: string
  sort?: string
  limit?: number
  offset?: number
}): Promise<ModerationQueueResponse> {
  const sp = new URLSearchParams()
  if (params?.reason) sp.set("reason", params.reason)
  if (params?.target_type) sp.set("target_type", params.target_type)
  if (params?.sort) sp.set("sort", params.sort)
  if (params?.limit) sp.set("limit", String(params.limit))
  if (params?.offset != null) sp.set("offset", String(params.offset))
  const qs = sp.toString()
  const res = await api<ApiSuccessResponse<ModerationQueueResponse>>(
    `/v1/admin/forum/moderation/queue${qs ? `?${qs}` : ""}`
  )
  return res.data
}

export async function performModerationAction(data: ModerationActionRequest) {
  const res = await api<ApiSuccessResponse<{ actioned: boolean }>>(
    "/v1/admin/forum/moderation/action",
    { method: "POST", body: data }
  )
  return res.data
}
