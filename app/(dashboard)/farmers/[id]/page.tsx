"use client"

import { use } from "react"
import { FarmerProfileClient } from "@/features/farmers/components/farmer-profile-client"

export default function FarmerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <FarmerProfileClient farmerId={id} />
}
