import type { Metadata } from "next"
import { SupportClient } from "@/features/support/components/support-client"
import { PAGE_METADATA } from "@/lib/constants/app"

const page = PAGE_METADATA["/support"]

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function SupportPage() {
  return <SupportClient />
}
