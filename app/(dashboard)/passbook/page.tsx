import type { Metadata } from "next"
import { PAGE_METADATA } from "@/lib/constants/app"
import { PassbookTableClient } from "@/features/passbook/components/passbook-table-client"

const page = PAGE_METADATA["/passbook"]

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function PassbookPage() {
  return <PassbookTableClient />
}
