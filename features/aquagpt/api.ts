import { api } from "@/lib/api/client"
import type { ApiSuccessResponse } from "@/types/auth"
import type {
  AquagptAnalytics,
  UsageLogDTO,
  UsageLogRow,
  UsageSummary,
} from "./types"
import type { DataTableQueryResult } from "@/lib/table/table-types"

/* ── Analytics ── */

export async function getAquagptAnalytics(
  range: string = "7d"
): Promise<AquagptAnalytics> {
  const res = await api<ApiSuccessResponse<AquagptAnalytics>>(
    `/v1/admin/analytics/aquagpt?range=${range}`
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
