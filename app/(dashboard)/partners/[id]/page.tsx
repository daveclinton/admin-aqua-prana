"use client"

import { use } from "react"
import { PartnerProfileClient } from "@/features/partners/components/partner-profile-client"

export default function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <PartnerProfileClient partnerId={id} />
}
