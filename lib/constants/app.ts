export const APP_NAME = "Aqua Prana"
export const APP_DESCRIPTION = "Admin Dashboard"
export const APP_LOGO = "/logo.png"

export type PageMeta = {
  title: string
  description: string
  eyebrow?: string
  showExport?: boolean
}

export const PAGE_METADATA: Record<string, PageMeta> = {
  "/overview": {
    title: "Overview",
    eyebrow: "Dashboard",
    description: "Dashboard overview with key metrics and system health.",
  },
  "/farmers": {
    title: "Farmers",
    eyebrow: "Users",
    description: "Manage farmer accounts, view verification status, and monitor account activity.",
    showExport: true,
  },
  "/partners": {
    title: "Partners",
    eyebrow: "Users",
    description: "Manage partner accounts, review verification documents, and control activation status.",
    showExport: true,
  },
  "/aquagpt": {
    title: "AquaGPT",
    eyebrow: "AI",
    description: "AI-powered assistant for agricultural insights.",
  },
  "/marketplace": {
    title: "Marketplace",
    eyebrow: "Commerce",
    description: "Manage product listings, review orders, and monitor marketplace activity.",
    showExport: true,
  },
  "/passbook": {
    title: "Passbook",
    eyebrow: "Finance",
    description: "View and monitor farmer passbook entries, transactions, and activity logs.",
    showExport: true,
  },
  "/communication": {
    title: "Communication",
    eyebrow: "Outreach",
    description: "Send notifications, messages, and announcements.",
  },
  "/community-forum": {
    title: "Community Forum",
    eyebrow: "Community",
    description: "Manage community discussions and forum posts.",
  },
  "/support": {
    title: "Support",
    eyebrow: "Help",
    description: "View and manage support tickets and requests.",
  },
  "/analytics": {
    title: "Analytics",
    eyebrow: "Insights",
    description: "View platform analytics, reports, and trends.",
  },
  "/billing": {
    title: "Billing",
    eyebrow: "Finance",
    description: "Manage billing, invoices, and payment information.",
  },
  "/team": {
    title: "Team",
    eyebrow: "Management",
    description: "Manage team members, roles, and permissions.",
    showExport: true,
  },
  "/settings": {
    title: "Settings",
    eyebrow: "Configuration",
    description: "Configure application and account settings.",
  },
  "/settings/profile": {
    title: "Profile Settings",
    eyebrow: "Configuration",
    description: "Update your profile information and preferences.",
  },
  "/settings/security": {
    title: "Security Settings",
    eyebrow: "Configuration",
    description: "Manage passwords, two-factor authentication, and security.",
  },
  "/settings/notifications": {
    title: "Notification Settings",
    eyebrow: "Configuration",
    description: "Configure notification preferences and channels.",
  },
}
