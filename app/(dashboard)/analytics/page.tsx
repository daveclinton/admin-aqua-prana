import type { Metadata } from "next"
import { AnalyticsClient } from "@/features/analytics/components/analytics-client"
import { PAGE_METADATA } from "@/lib/constants/app"

const page = PAGE_METADATA["/analytics"]

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function AnalyticsPage() {
  return <AnalyticsClient />
}
