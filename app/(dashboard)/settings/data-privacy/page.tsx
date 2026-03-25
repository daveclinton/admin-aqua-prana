import type { Metadata } from "next"
import { DataPrivacySettingsClient } from "@/features/settings/components/data-privacy-settings-client"

export const metadata: Metadata = {
  title: "Data & Privacy",
  description: "Manage data exports and account deletion.",
}

export default function DataPrivacyPage() {
  return <DataPrivacySettingsClient />
}
