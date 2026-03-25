import type { Metadata } from "next"
import { PreferencesSettingsClient } from "@/features/settings/components/preferences-settings-client"

export const metadata: Metadata = {
  title: "Preferences",
  description: "Customize dashboard experience.",
}

export default function PreferencesPage() {
  return <PreferencesSettingsClient />
}
