import type { Metadata } from "next"
import { PAGE_METADATA } from "@/lib/constants/app"

const page = PAGE_METADATA["/team"]

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function TeamPage() {
  return <div>Team</div>
}
