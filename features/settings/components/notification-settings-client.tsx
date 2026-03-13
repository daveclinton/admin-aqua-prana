"use client"

import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const notificationOptions = [
  {
    id: "security_alerts",
    label: "Security alerts",
    description: "Get notified about suspicious login activity or password changes.",
    defaultChecked: true,
    disabled: true,
  },
  {
    id: "new_user_signups",
    label: "New user sign-ups",
    description: "Receive a notification when a new farmer or partner registers.",
    defaultChecked: false,
  },
  {
    id: "verification_requests",
    label: "Verification requests",
    description: "Get notified when a user submits documents for verification review.",
    defaultChecked: true,
  },
  {
    id: "system_alerts",
    label: "System alerts",
    description: "Critical system issues, error spikes, and downtime notifications.",
    defaultChecked: true,
    disabled: true,
  },
  {
    id: "marketplace_activity",
    label: "Marketplace activity",
    description: "New product listings, flagged products, and order issues.",
    defaultChecked: false,
  },
  {
    id: "forum_moderation",
    label: "Forum moderation",
    description: "Flagged or hidden posts that need admin review.",
    defaultChecked: false,
  },
]

export function NotificationSettingsClient() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email notifications</CardTitle>
          <CardDescription>
            Choose which notifications you receive by email. Some security
            notifications cannot be disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {notificationOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div className="space-y-0.5 pr-4">
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <Switch
                  defaultChecked={option.defaultChecked}
                  disabled={option.disabled}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
