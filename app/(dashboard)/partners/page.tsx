import type { Metadata } from "next"
import { PAGE_METADATA } from "@/lib/constants/app"
import { PartnersTableClient } from "@/features/partners/components/partners-table-client"
import { CampaignsTable } from "@/features/partners/components/campaigns-table"

const page = PAGE_METADATA["/partners"]

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function PartnersPage() {
  return (
    <div className="space-y-8">
      <PartnersTableClient />
      <CampaignsTable />
    </div>
  )
}
