"use client"

import { useState } from "react"
import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AquagptAnalytics } from "./aquagpt-analytics"
import { UsageLogsTableClient } from "./usage-logs-table-client"
import { AskAiDrawer } from "./ask-ai-drawer"

export function AquagptClient() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="space-y-8">
      {/* Ask AI button - floating */}
      <div className="flex justify-end">
        <Button onClick={() => setDrawerOpen(true)} className="gap-2">
          <Bot className="h-4 w-4" />
          Ask AquaGPT
        </Button>
      </div>

      <AquagptAnalytics />
      <UsageLogsTableClient />

      <AskAiDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
