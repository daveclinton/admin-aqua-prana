import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type {
  AquagptAnalytics,
  AccuracyTrend,
  ModelStatus,
  ChatDTO,
  ChatRow,
  TopicClusteringData,
  UsageLogDTO,
  UsageLogRow,
  UsageSummary,
} from "./types"
import type { DataTableQueryResult } from "@/lib/table/table-types"

/* ── Analytics ── */

type AquagptAnalyticsRaw = {
  summary: AquagptAnalytics["summary"]
  daily_usage: AquagptAnalytics["daily"]
}

export async function getAquagptAnalytics(
  range: string = "7d"
): Promise<AquagptAnalytics> {
  const res = await api<ApiSuccessResponse<AquagptAnalyticsRaw>>(
    `/v1/admin/analytics/aquagpt?range=${range}`
  )
  return {
    summary: res.data.summary,
    daily: res.data.daily_usage,
  }
}

/* ── Accuracy trend ── */

export async function getAccuracyTrend(
  range: string = "7d"
): Promise<AccuracyTrend> {
  const res = await api<ApiSuccessResponse<AccuracyTrend>>(
    `/v1/admin/aquagpt/accuracy?range=${range}`
  )
  return res.data
}

/* ── Model status ── */

export async function getModelStatus(): Promise<ModelStatus> {
  const res = await api<ApiSuccessResponse<ModelStatus>>(
    "/v1/admin/aquagpt/model-status"
  )
  return res.data
}

/* ── Chats table ── */

type ChatsResponse = {
  chats: ChatDTO[]
  total: number
}

type GetChatsParams = {
  pageIndex: number
  pageSize: number
  globalFilter: string
}

export async function getAquagptChats(
  params: GetChatsParams
): Promise<DataTableQueryResult<ChatRow>> {
  const searchParams = new URLSearchParams({
    limit: String(params.pageSize),
    offset: String(params.pageIndex * params.pageSize),
  })

  if (params.globalFilter) {
    searchParams.set("search", params.globalFilter)
  }

  const res = await api<ApiSuccessResponse<ChatsResponse>>(
    `/v1/admin/aquagpt/chats?${searchParams}`
  )

  const rows = res.data.chats.map(mapChatToRow)
  const pageCount = Math.max(1, Math.ceil(res.data.total / params.pageSize))

  return { rows, rowCount: res.data.total, pageCount }
}

function mapChatToRow(dto: ChatDTO): ChatRow {
  return {
    id: dto.id,
    userId: dto.user_id,
    chatId: dto.conversation_id,
    topic: dto.topic || "-",
    messages: dto.message_count,
    lastActive: dto.last_active,
    accuracy: dto.accuracy,
    rating: dto.rating,
    escalated: dto.escalated,
  }
}

/* ── Topic clustering ── */

export async function getTopicClustering(
  range: string = "7d"
): Promise<TopicClusteringData> {
  const res = await api<ApiSuccessResponse<TopicClusteringData>>(
    `/v1/admin/aquagpt/topics?range=${range}`
  )
  return res.data
}

/* ── Usage logs ── */

type UsageLogsResponse = {
  logs: UsageLogDTO[]
  summary: UsageSummary
  total: number
}

type GetUsageLogsParams = {
  pageIndex: number
  pageSize: number
  globalFilter: string
  status?: string
}

export async function getUsageLogs(
  params: GetUsageLogsParams
): Promise<DataTableQueryResult<UsageLogRow> & { summary: UsageSummary }> {
  const searchParams = new URLSearchParams({
    limit: String(params.pageSize),
    offset: String(params.pageIndex * params.pageSize),
  })

  if (params.globalFilter) {
    searchParams.set("search", params.globalFilter)
  }
  if (params.status) {
    searchParams.set("status", params.status)
  }

  const res = await api<ApiSuccessResponse<UsageLogsResponse>>(
    `/v1/chat/usage?${searchParams}`
  )

  const rows = res.data.logs.map(mapLogToRow)
  const pageCount = Math.max(1, Math.ceil(res.data.total / params.pageSize))

  return {
    rows,
    rowCount: res.data.total,
    pageCount,
    summary: res.data.summary,
  }
}

function mapLogToRow(dto: UsageLogDTO): UsageLogRow {
  return {
    id: dto.id,
    userName: dto.user_name || "Unknown",
    userEmail: dto.user_email || "",
    userMessage: dto.user_message,
    model: dto.model,
    totalTokens: dto.total_tokens,
    latencyMs: dto.latency_ms,
    status: dto.status,
    createdAt: dto.created_at,
  }
}

/* ── Chat (for Ask AI drawer) ── */

export async function createConversation(
  title: string
): Promise<{ id: string }> {
  const res = await api<ApiSuccessResponse<{ id: string }>>("/v1/chat", {
    method: "POST",
    body: { title },
  })
  return res.data
}

export function streamCompletion(
  conversationId: string,
  message: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
) {
  const controller = new AbortController()

  fetch(`/api/proxy/v1/chat/${conversationId}/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message, stream: true, tool_mode: "off" }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        onError(err?.error?.message || "Request failed")
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        onError("No response body")
        return
      }

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6).trim()
          if (data === "[DONE]") {
            onDone()
            return
          }
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) onChunk(content)
          } catch {
            // skip non-JSON lines
          }
        }
      }
      onDone()
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        onError(err.message || "Stream failed")
      }
    })

  return () => controller.abort()
}

/* ── Topic classification ── */

/**
 * Predefined topic categories for aquaculture conversations.
 * The backend should use this same list in its classification prompt.
 */
export const TOPIC_CATEGORIES = [
  "DO / Oxygen Issues",
  "White Spot Disease",
  "Feed Rate Optimisation",
  "pH Correction",
  "Stock Density",
  "Mortality Events",
  "Probiotic Usage",
  "Water Quality",
  "Harvest",
  "Pond Management",
  "Equipment",
  "General",
] as const

export type TopicCategory = (typeof TOPIC_CATEGORIES)[number]

/**
 * Classifies a user message into a topic and saves it on the conversation.
 * Fire-and-forget — failures are silently ignored.
 *
 * Calls POST /v1/chat/{id}/classify which should:
 * 1. Send the message + categories to the LLM
 * 2. Save the classified topic on the conversation row
 */
export async function classifyConversationTopic(
  conversationId: string,
  userMessage: string
): Promise<void> {
  try {
    await api<ApiSuccessResponse<{ topic: string }>>(
      `/v1/chat/${conversationId}/classify`,
      {
        method: "POST",
        body: {
          message: userMessage,
          categories: TOPIC_CATEGORIES,
        },
      }
    )
  } catch {
    // Classification endpoint not available — skip silently
  }
}
