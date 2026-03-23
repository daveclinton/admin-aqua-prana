"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { queryKeys } from "@/lib/react-query/query-keys"
import { getModelStatus } from "@/features/aquagpt/api"
import { AquagptAnalytics } from "./aquagpt-analytics"
import { AccuracyTrendCard } from "./accuracy-trend-card"
import { ModelStatusCard } from "./model-status-card"
import { ChatsTableClient } from "./chats-table-client"
import { TopicClustering } from "./topic-clustering"
import { AskAiDrawer } from "./ask-ai-drawer"
import { cn } from "@/lib/utils"

export function AquagptClient() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data: modelStatus } = useQuery({
    queryKey: queryKeys.aquagpt.modelStatus,
    queryFn: getModelStatus,
    staleTime: 30_000,
    retry: 1,
  })

  return (
    <div className="space-y-6">
      {/* Header with version badge + Ask button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AquaGPT</h2>
        <div className="flex items-center gap-3">
          {modelStatus && (
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 px-3 py-1",
                modelStatus.status === "live"
                  ? "border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
                  : "border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-400"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  modelStatus.status === "live" ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
              v{modelStatus.version} {modelStatus.status === "live" ? "Live" : "Training"}
            </Badge>
          )}
          <Button onClick={() => setDrawerOpen(true)} className="gap-2">
            <Bot className="h-4 w-4" />
            Ask AquaGPT
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <AquagptAnalytics />

      {/* Accuracy trend + Model status side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AccuracyTrendCard range="7d" />
        <ModelStatusCard />
      </div>

      {/* Chats table */}
      <ChatsTableClient />

      {/* Topic clustering */}
      <TopicClustering />

      {/* AI drawer */}
      <AskAiDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
