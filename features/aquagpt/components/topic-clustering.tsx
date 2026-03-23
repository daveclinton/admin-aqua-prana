"use client"

import { useQuery } from "@tanstack/react-query"
import { useQueryState, parseAsStringLiteral } from "nuqs"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { queryKeys } from "@/lib/react-query/query-keys"
import { getTopicClustering } from "@/features/aquagpt/api"
import { cn } from "@/lib/utils"

const barColors = [
  "bg-red-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-amber-400",
  "bg-blue-500",
  "bg-red-400",
  "bg-blue-400",
  "bg-emerald-400",
]

export function TopicClustering() {
  const [range, setRange] = useQueryState(
    "trange",
    parseAsStringLiteral(["7d", "30d"] as const).withDefault("7d")
  )

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.aquagpt.topics(range),
    queryFn: () => getTopicClustering(range),
    staleTime: 60_000,
    retry: 1,
  })

  const topics = data?.topics ?? []
  const insights = data?.insights ?? []
  const maxCount = Math.max(...topics.map((t) => t.query_count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Topic Clustering — What Are Farmers Asking?
        </CardTitle>
        <CardAction>
          <Tabs
            value={range}
            onValueChange={(v) => void setRange(v as "7d" | "30d")}
          >
            <TabsList className="h-8">
              <TabsTrigger value="7d" className="px-3 text-xs">7D</TabsTrigger>
              <TabsTrigger value="30d" className="px-3 text-xs">30D</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Bar chart */}
            <div className="space-y-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Query Volume by Topic
              </p>
              <div className="space-y-3">
                {topics.map((topic, i) => (
                  <div key={topic.topic} className="flex items-center gap-3">
                    <span className="w-48 shrink-0 truncate text-sm font-medium">
                      {topic.topic}
                    </span>
                    <div className="relative flex-1">
                      <div className="h-3 w-full rounded-full bg-muted" />
                      <div
                        className={cn(
                          "absolute left-0 top-0 h-3 rounded-full transition-all",
                          topic.color || barColors[i % barColors.length]
                        )}
                        style={{
                          width: `${(topic.query_count / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right text-xs font-semibold text-muted-foreground">
                      {topic.query_count.toLocaleString()} queries
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Insight actions */}
            {insights.length > 0 && (
              <div className="space-y-1">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Insight Actions
                </p>
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={cn(
                        "rounded-xl border p-4",
                        insight.type === "knowledge_gap"
                          ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30"
                          : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
                      )}
                    >
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          insight.type === "knowledge_gap"
                            ? "text-red-600 dark:text-red-400"
                            : "text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {insight.type === "knowledge_gap"
                          ? "Knowledge Gap"
                          : "Trending Topic"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {insight.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {insight.description}
                      </p>
                      <Button
                        size="sm"
                        variant={
                          insight.type === "knowledge_gap"
                            ? "default"
                            : "outline"
                        }
                        className="mt-3"
                        asChild
                      >
                        <a href={insight.action_href}>
                          {insight.action_label} →
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
