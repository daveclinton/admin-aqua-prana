import type { Metadata } from "next"
import { AuditSettingsClient } from "@/features/settings/components/audit-settings-client"

export const metadata: Metadata = {
  title: "Audit Log",
  description: "View account activity log.",
}

export default function AuditPage() {
  return <AuditSettingsClient />
}
