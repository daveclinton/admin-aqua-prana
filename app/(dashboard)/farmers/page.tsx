import type { Metadata } from "next"
import { PAGE_METADATA } from "@/lib/constants/app"

const page = PAGE_METADATA["/farmers"]

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function FarmersPage() {
  return <div>Farmers</div>
}
