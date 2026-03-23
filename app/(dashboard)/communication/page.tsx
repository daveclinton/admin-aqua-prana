import type { Metadata } from "next"
import { PAGE_METADATA } from "@/lib/constants/app"
import { CommunicationClient } from "@/features/communication/components/communication-client"

const page = PAGE_METADATA["/communication"]

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function CommunicationPage() {
  return <CommunicationClient />
}
