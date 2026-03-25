"use client"

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

export function PreferencesSettingsClient() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
          <CardDescription>
            Customize your dashboard experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">
                Switch between light and dark themes.
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Compact View</p>
              <p className="text-xs text-muted-foreground">
                Reduce spacing for a more dense data view.
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Default Currency</p>
              <p className="text-xs text-muted-foreground">
                Currency used for displaying amounts.
              </p>
            </div>
            <Button variant="outline" className="h-9 w-24 justify-between rounded-lg">
              ₹
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
