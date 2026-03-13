"use client"

import { Upload } from "lucide-react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { UserAvatar } from "@/components/shared/user-avatar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { PAGE_METADATA } from "@/lib/constants/app"
import { useCurrentUser } from "@/features/auth/hooks/use-current-user"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function usePageHeader() {
  const pathname = usePathname()
  const { data: user } = useCurrentUser()
  const page = PAGE_METADATA[pathname as keyof typeof PAGE_METADATA]

  if (pathname === "/overview") {
    const firstName = user?.first_name || user?.name?.split(" ")[0] || "Admin"
    return {
      eyebrow: page?.eyebrow,
      title: `${getGreeting()}, ${firstName}`,
      description: page?.description,
      showExport: false,
      user,
    }
  }

  return {
    eyebrow: page?.eyebrow,
    title: page?.title ?? "",
    description: page?.description,
    showExport: page?.showExport ?? false,
    user,
  }
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { eyebrow, title, description, showExport, user } = usePageHeader()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex shrink-0 items-start justify-between gap-4 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-start gap-2">
            <SidebarTrigger className="mt-0.5 -ml-1" />
            <Separator orientation="vertical" className="mr-2 h-8" />
            <div className="space-y-0.5">
              {eyebrow ? (
                <p className="text-[0.625rem] font-semibold tracking-[0.24em] text-primary uppercase">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="text-sm font-semibold tracking-tight">
                {title}
              </h1>
              {description ? (
                <p className="text-xs text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {showExport ? (
              <Button variant="outline" size="sm">
                <Upload className="size-3.5" />
                Export
              </Button>
            ) : null}
            <UserAvatar
              src={user?.image}
              name={user?.name}
              email={user?.email}
              className="size-8"
            />
          </div>
        </header>
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
