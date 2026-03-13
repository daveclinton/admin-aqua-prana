"use client"

import Link from "next/link"
import { ChevronDown, LogOut, Settings } from "lucide-react"
import { useCurrentUser } from "@/features/auth/hooks/use-current-user"
import { useLogout } from "@/features/auth/hooks/use-logout"
import { UserAvatar } from "@/components/shared/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

export function HeaderUserMenu() {
  const { data: user, isLoading } = useCurrentUser()
  const logoutMutation = useLogout()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2.5 rounded-full border border-border bg-muted/50 px-3 py-1.5">
        <Skeleton className="size-8 rounded-full" />
        <div>
          <Skeleton className="mb-1 h-3 w-16" />
          <Skeleton className="h-2.5 w-28" />
        </div>
      </div>
    )
  }

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      user.email
    : "User"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2.5 rounded-full border border-border bg-muted/50 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
          <UserAvatar
            src={user?.image}
            name={displayName}
            email={user?.email}
            className="size-8"
          />
          <div className="hidden text-left md:block">
            <div className="text-xs font-semibold leading-tight">
              {displayName}
            </div>
            {user?.email && (
              <div className="text-[10.5px] leading-tight text-muted-foreground">
                {user.email}
              </div>
            )}
          </div>
          <ChevronDown className="hidden size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 md:block" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-lg" align="end" sideOffset={8}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserAvatar
              src={user?.image}
              name={displayName}
              email={user?.email}
              className="rounded-lg"
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{displayName}</span>
              {user?.email && (
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
