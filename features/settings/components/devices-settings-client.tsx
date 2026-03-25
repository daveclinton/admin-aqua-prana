"use client"

import { Monitor, Smartphone, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const devices = [
  {
    icon: Monitor,
    name: "MacBook Pro — Chrome",
    location: "Nairobi · Active now",
    status: "Active",
    statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
    current: true,
  },
  {
    icon: Smartphone,
    name: "iPhone 15 — Safari",
    location: "Nairobi · 2 hrs ago",
    status: "Active",
    statusColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
    current: false,
  },
  {
    icon: Globe,
    name: "Windows PC — Firefox",
    location: "Mombasa · 3 days ago",
    status: "",
    statusColor: "",
    current: false,
  },
] as const

export function DevicesSettingsClient() {
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
            <Button variant="outline" size="sm" className="rounded-full text-red-600 border-red-200 hover:bg-red-50">
              Revoke All Others
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.name}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                  <device.icon className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {device.name}
                    {device.current && (
                      <span className="ml-2 text-xs text-muted-foreground">(this device)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{device.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {device.status && (
                  <Badge
                    variant="outline"
                    className={cn("rounded-full px-2.5 py-1", device.statusColor)}
                  >
                    {device.status}
                  </Badge>
                )}
                {!device.current && !device.status && (
                  <Button variant="outline" size="sm" className="rounded-full text-red-600 border-red-200 hover:bg-red-50">
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
