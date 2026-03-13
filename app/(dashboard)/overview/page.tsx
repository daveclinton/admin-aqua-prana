"use client"

import { useCurrentUser } from "@/features/auth/hooks/use-current-user"

export default function OverviewPage() {
  const { data: user, isLoading, error } = useCurrentUser()

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading user...</p>
  if (error) return <p className="text-xs text-destructive">Failed to load user: {error.message}</p>

  return (
    <div className="grid gap-4">
      <h1 className="text-sm font-medium">Dashboard Overview</h1>
      <pre className="rounded-md bg-muted p-3 text-xs">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  )
}
