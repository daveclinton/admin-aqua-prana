import type { Metadata } from "next"
import { PAGE_METADATA } from "@/lib/constants/app"

const page = PAGE_METADATA["/partners"]

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function PartnersPage() {
  return <div>Partners</div>
}
