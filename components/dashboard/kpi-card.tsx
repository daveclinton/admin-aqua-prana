import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type KpiCardProps = {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: string
  className?: string
  variant?: "default" | "teal" | "green" | "amber" | "red"
}

const variantStyles = {
  default: {
    card: "bg-card text-card-foreground border",
    icon: "bg-muted text-muted-foreground",
    trend: "bg-primary/15 text-primary",
    title: "text-muted-foreground",
    value: "text-foreground",
  },
  teal: {
    card: "bg-gradient-to-br from-teal-600 to-teal-700 text-white border-0",
    icon: "bg-white/15 text-white",
    trend: "bg-white/20 text-white",
    title: "text-white/80",
    value: "text-white",
  },
  green: {
    card: "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0",
    icon: "bg-white/15 text-white",
    trend: "bg-white/20 text-white",
    title: "text-white/80",
    value: "text-white",
  },
  amber: {
    card: "bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0",
    icon: "bg-white/15 text-white",
    trend: "bg-white/20 text-white",
    title: "text-white/80",
    value: "text-white",
  },
  red: {
    card: "bg-gradient-to-br from-red-500 to-red-600 text-white border-0",
    icon: "bg-white/15 text-white",
    trend: "bg-white/20 text-white",
    title: "text-white/80",
    value: "text-white",
  },
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  variant = "default",
}: KpiCardProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 shadow-sm",
        styles.card,
        className
      )}
    >
      {/* Top row: icon + trend */}
      <div className="flex items-center justify-between">
        <div className={cn("flex size-10 items-center justify-center rounded-xl", styles.icon)}>
          <Icon className="size-5" />
        </div>
        {trend && (
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", styles.trend)}>
            {trend}
          </span>
        )}
      </div>

      {/* Value + label */}
      <div className="mt-4">
        <p className={cn("text-3xl font-bold tracking-tight", styles.value)}>
          {value}
        </p>
        <p className={cn("mt-1 text-xs font-medium uppercase tracking-wider", styles.title)}>
          {title}
        </p>
        {subtitle && (
          <p className={cn("mt-0.5 text-[0.625rem]", styles.title)}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
