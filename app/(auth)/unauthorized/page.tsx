import type { Metadata } from "next"
import Link from "next/link"
import { ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Unauthorized",
  description: "You do not have permission to access this page.",
}

export default function UnauthorizedPage() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX className="size-6 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Access denied</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You don&apos;t have permission to access this resource.
      </p>
      <Button asChild className="mt-6">
        <Link href="/login">Back to Sign in</Link>
      </Button>
    </div>
  )
}
