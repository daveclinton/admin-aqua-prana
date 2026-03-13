import type { Metadata } from "next"
import { PAGE_METADATA } from "@/lib/constants/app"
import { MarketplaceClient } from "@/features/marketplace/components/marketplace-client"

const page = PAGE_METADATA["/marketplace"]

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function MarketplacePage() {
  return <MarketplaceClient />
}
