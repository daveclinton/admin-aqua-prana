"use client"

import Image from "next/image"
import Link from "next/link"
import { APP_NAME, APP_DESCRIPTION, APP_LOGO } from "@/lib/constants/app"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export function AppLogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href="/overview">
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
              <Image
                src={APP_LOGO}
                alt={APP_NAME}
                width={32}
                height={32}
                unoptimized
                className="size-8 object-cover"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{APP_NAME}</span>
              <span className="truncate text-xs text-sidebar-foreground/60">
                {APP_DESCRIPTION}
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
