"use client"

import { Upload } from "lucide-react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { UserAvatar } from "@/components/shared/user-avatar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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

  // Build breadcrumb segments
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: { label: string; href?: string }[] = [
    { label: "Dashboard", href: "/overview" },
  ]
  if (segments.length > 0) {
    // For nested routes like /settings/profile, add parent
    if (segments.length > 1) {
      const parentPath = `/${segments[0]}`
      const parentMeta = PAGE_METADATA[parentPath as keyof typeof PAGE_METADATA]
      breadcrumbs.push({
        label: parentMeta?.title ?? segments[0].charAt(0).toUpperCase() + segments[0].slice(1),
        href: parentPath,
      })
    }
    // Current page (no href = active page)
    breadcrumbs.push({
      label: page?.title ?? segments[segments.length - 1].charAt(0).toUpperCase() + segments[segments.length - 1].slice(1),
    })
  }

  if (pathname === "/overview") {
    const firstName = user?.first_name || user?.name?.split(" ")[0] || "Admin"
    return {
      eyebrow: page?.eyebrow,
      title: `${getGreeting()}, ${firstName}`,
      description: page?.description,
      showExport: false,
      user,
      breadcrumbs,
    }
  }

  return {
    eyebrow: page?.eyebrow,
    title: page?.title ?? "",
    description: page?.description,
    showExport: page?.showExport ?? false,
    user,
    breadcrumbs,
  }
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { eyebrow, title, description, showExport, user, breadcrumbs } = usePageHeader()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex shrink-0 items-start justify-between gap-4 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-start gap-2">
            <SidebarTrigger className="mt-0.5 -ml-1" />
            <Separator orientation="vertical" className="mr-2 h-8" />
            <div className="space-y-1">
              {/* Breadcrumb */}
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, i) => {
                    const isLast = i === breadcrumbs.length - 1
                    return (
                      <BreadcrumbItem key={crumb.label}>
                        {i > 0 && <BreadcrumbSeparator />}
                        {isLast ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href}>
                            {crumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    )
                  })}
                </BreadcrumbList>
              </Breadcrumb>

              {/* Title */}
              <h1 className="text-lg font-semibold tracking-tight">
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
