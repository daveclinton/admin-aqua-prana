import type { Metadata } from "next"
import { DevicesSettingsClient } from "@/features/settings/components/devices-settings-client"

export const metadata: Metadata = {
  title: "Devices",
  description: "Manage active devices and sessions.",
}

export default function DevicesPage() {
  return <DevicesSettingsClient />
}
