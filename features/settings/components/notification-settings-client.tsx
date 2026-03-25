"use client"

import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  useNotificationPreferences,
  useUpdateNotificationPreference,
} from "@/features/settings/hooks/use-notification-preferences"
import type { NotificationCategory } from "@/types/auth"

const categoryMeta: Record<
  NotificationCategory,
  { label: string; description: string }
> = {
  alerts: {
    label: "Alerts",
    description:
      "Security alerts, suspicious login activity, and critical notifications.",
  },
  tasks: {
    label: "Tasks",
    description:
      "Task assignments, reminders, and completion updates.",
  },
  system: {
    label: "System",
    description:
      "System health, downtime, maintenance, and platform-wide announcements.",
  },
}

export function NotificationSettingsClient() {
  const { data, isLoading } = useNotificationPreferences()
  const updateMutation = useUpdateNotificationPreference()

  function handleToggle(category: NotificationCategory, enabled: boolean) {
    updateMutation.mutate(
      { category, enabled },
      {
        onSuccess: () => toast.success("Notification preference updated"),
        onError: () => toast.error("Failed to update preference"),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const preferences = data?.preferences ?? []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email notifications</CardTitle>
          <CardDescription>
            Choose which notifications you receive by email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {preferences.map((pref) => {
              const meta = categoryMeta[pref.category]
              return (
                <div
                  key={pref.category}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="space-y-0.5 pr-4">
                    <p className="text-sm font-medium">
                      {meta?.label ?? pref.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {meta?.description ?? ""}
                    </p>
                  </div>
                  <Switch
                    checked={pref.enabled}
                    disabled={updateMutation.isPending}
                    onCheckedChange={(checked) =>
                      handleToggle(pref.category, checked)
                    }
                  />
                </div>
              )
            })}
            {preferences.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">
                No notification preferences available.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
