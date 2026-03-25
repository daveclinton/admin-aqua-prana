import type { Metadata } from "next"
import { CommunityForumClient } from "@/features/community-forum/components/community-forum-client"
import { PAGE_METADATA } from "@/lib/constants/app"

const page = PAGE_METADATA["/community-forum"]

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function CommunityForumPage() {
  return <CommunityForumClient />
}
