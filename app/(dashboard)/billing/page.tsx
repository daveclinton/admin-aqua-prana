import type { Metadata } from "next"
import { BillingClient } from "@/features/billing/components/billing-client"
import { PAGE_METADATA } from "@/lib/constants/app"

const page = PAGE_METADATA["/billing"]

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function BillingPage() {
  return <BillingClient />
}
