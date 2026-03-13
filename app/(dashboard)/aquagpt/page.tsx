import type { Metadata } from "next"
import { PAGE_METADATA } from "@/lib/constants/app"

const page = PAGE_METADATA["/aquagpt"]

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function AquaGptPage() {
  return <div>AquaGPT</div>
}
