import {
  LayoutDashboard,
  Users,
  Handshake,
  Bot,
  ShoppingBag,
  BookOpen,
  MessageSquare,
  MessagesSquare,
  LifeBuoy,
  BarChart3,
  CreditCard,
  UsersRound,
  Settings,
} from "lucide-react"

export const sidebarNavigation = [
  {
    title: "Main",
    items: [
      {
        title: "Overview",
        href: "/overview",
        icon: LayoutDashboard,
      },
      {
        title: "Farmers",
        href: "/farmers",
        icon: Users,
      },
      {
        title: "Partners",
        href: "/partners",
        icon: Handshake,
      },
    ],
  },
  {
    title: "Services",
    items: [
      {
        title: "AquaGPT",
        href: "/aquagpt",
        icon: Bot,
      },
      {
        title: "Marketplace",
        href: "/marketplace",
        icon: ShoppingBag,
      },
      {
        title: "Passbook",
        href: "/passbook",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "Engagement",
    items: [
      {
        title: "Communication",
        href: "/communication",
        icon: MessageSquare,
      },
      {
        title: "Community Forum",
        href: "/community-forum",
        icon: MessagesSquare,
      },
      {
        title: "Support",
        href: "/support",
        icon: LifeBuoy,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        title: "Billing",
        href: "/billing",
        icon: CreditCard,
      },
      {
        title: "Team",
        href: "/team",
        icon: UsersRound,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
] as const
