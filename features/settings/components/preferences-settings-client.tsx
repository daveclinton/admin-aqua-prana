"use client"

import { toast } from "sonner"
import { ChevronDown } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  usePreferences,
  useUpdatePreferences,
} from "@/features/settings/hooks/use-preferences"

const currencies = ["INR", "USD", "EUR", "GBP", "KES"] as const
const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  KES: "KSh",
}

export function PreferencesSettingsClient() {
  const { data, isLoading } = usePreferences()
  const updateMutation = useUpdatePreferences()

  function handleToggle(key: "dark_mode" | "compact_view", value: boolean) {
    updateMutation.mutate(
      { [key]: value },
      {
        onSuccess: () => toast.success("Preference updated"),
        onError: () => toast.error("Failed to update preference"),
      }
    )
  }

  function handleCurrency(currency: string) {
    updateMutation.mutate(
      { currency },
      {
        onSuccess: () => toast.success("Currency updated"),
        onError: () => toast.error("Failed to update currency"),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const prefs = data ?? { dark_mode: false, compact_view: false, currency: "INR" }

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
            <Switch
              checked={prefs.dark_mode}
              disabled={updateMutation.isPending}
              onCheckedChange={(v) => handleToggle("dark_mode", v)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Compact View</p>
              <p className="text-xs text-muted-foreground">
                Reduce spacing for a more dense data view.
              </p>
            </div>
            <Switch
              checked={prefs.compact_view}
              disabled={updateMutation.isPending}
              onCheckedChange={(v) => handleToggle("compact_view", v)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Default Currency</p>
              <p className="text-xs text-muted-foreground">
                Currency used for displaying amounts.
              </p>
            </div>
            <div className="flex gap-1.5">
              {currencies.map((c) => (
                <Button
                  key={c}
                  variant={prefs.currency === c ? "default" : "outline"}
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs"
                  disabled={updateMutation.isPending}
                  onClick={() => handleCurrency(c)}
                >
                  {currencySymbols[c]} {c}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
