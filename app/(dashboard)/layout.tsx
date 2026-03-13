import type { Metadata } from "next"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { APP_NAME } from "@/lib/constants/app"

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: `${APP_NAME} administration dashboard.`,
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
