"use client"

import { toast } from "sonner"
import { Monitor, Smartphone, Globe, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSessions, useRevokeSession } from "@/features/settings/hooks/use-sessions"
import { cn } from "@/lib/utils"
import type { SessionDevice } from "@/types/auth"

function getDeviceIcon(userAgent: string | null) {
  if (!userAgent) return Globe
  const ua = userAgent.toLowerCase()
  if (ua.includes("mobile") || ua.includes("iphone") || ua.includes("android"))
    return Smartphone
  return Monitor
}

function getDeviceLabel(userAgent: string | null) {
  if (!userAgent) return "Unknown device"
  const ua = userAgent

  let browser = "Unknown browser"
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome"
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari"
  else if (ua.includes("Firefox")) browser = "Firefox"
  else if (ua.includes("Edg")) browser = "Edge"

  let os = ""
  if (ua.includes("Mac")) os = "Mac"
  else if (ua.includes("Windows")) os = "Windows"
  else if (ua.includes("iPhone")) os = "iPhone"
  else if (ua.includes("Android")) os = "Android"
  else if (ua.includes("Linux")) os = "Linux"

  return os ? `${os} — ${browser}` : browser
}

function formatLastActive(dateStr: string, isCurrent: boolean) {
  if (isCurrent) return "Active now"
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? "s" : ""} ago`
}

export function DevicesSettingsClient() {
  const { data, isLoading } = useSessions()
  const revokeMutation = useRevokeSession()

  function handleRevoke(sessionId: string) {
    revokeMutation.mutate(
      { session_id: sessionId },
      {
        onSuccess: () => toast.success("Session revoked"),
        onError: () => toast.error("Failed to revoke session"),
      }
    )
  }

  function handleRevokeAll() {
    revokeMutation.mutate(
      { revoke_all_others: true },
      {
        onSuccess: () => toast.success("All other sessions revoked"),
        onError: () => toast.error("Failed to revoke sessions"),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const sessions = data?.sessions ?? []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Active Devices</CardTitle>
              <CardDescription>
                Manage devices that have access to your account.
              </CardDescription>
            </div>
            {sessions.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
                disabled={revokeMutation.isPending}
                onClick={handleRevokeAll}
              >
                {revokeMutation.isPending && (
                  <Loader2 className="size-3.5 animate-spin" />
                )}
                Revoke All Others
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.map((session) => {
            const Icon = getDeviceIcon(session.user_agent)
            return (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {getDeviceLabel(session.user_agent)}
                      {session.is_current && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (this device)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.ip_address ?? "Unknown IP"} ·{" "}
                      {formatLastActive(session.last_active_at, session.is_current)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.is_current ? (
                    <Badge
                      variant="outline"
                      className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
                      disabled={revokeMutation.isPending}
                      onClick={() => handleRevoke(session.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
          {sessions.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">
              No active sessions found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
