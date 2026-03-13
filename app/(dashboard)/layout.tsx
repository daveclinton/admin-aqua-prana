"use client"

import { useCurrentUser } from "@/features/auth/hooks/use-current-user"
import { useLogout } from "@/features/auth/hooks/use-logout"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: user, isLoading } = useCurrentUser()
  const logoutMutation = useLogout()

  return (
    <div className="min-h-svh">
      <header className="flex h-10 items-center justify-between border-b px-4">
        <span className="text-xs font-medium">Aqua Prana Admin</span>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="text-xs text-muted-foreground">Loading...</span>
          ) : user ? (
            <span className="text-xs text-muted-foreground">
              {user.first_name || user.email}
            </span>
          ) : null}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut />
          </Button>
        </div>
      </header>
      <main className="p-4">{children}</main>
    </div>
  )
}
