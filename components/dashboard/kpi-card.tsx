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
    shadow: "",
  },
  teal: {
    card: "bg-gradient-to-br from-[#0e7b70] to-[#14b8a6] border-0",
    icon: "bg-white/15 text-white",
    trend: "bg-white/20 text-white",
    title: "text-white/70",
    value: "text-white",
    shadow: "shadow-[0_8px_28px_rgba(14,123,112,0.3)]",
  },
  green: {
    card: "bg-gradient-to-br from-[#1b4332] to-[#2d8c5a] border-0",
    icon: "bg-white/15 text-white",
    trend: "bg-white/20 text-white",
    title: "text-white/70",
    value: "text-white",
    shadow: "shadow-[0_8px_28px_rgba(0,0,0,0.18)]",
  },
  amber: {
    card: "bg-gradient-to-br from-[#b45309] to-[#f59e0b] border-0",
    icon: "bg-white/15 text-white",
    trend: "bg-white/20 text-white",
    title: "text-white/70",
    value: "text-white",
    shadow: "shadow-[0_8px_28px_rgba(180,83,9,0.28)]",
  },
  red: {
    card: "bg-gradient-to-br from-[#991b1b] to-[#e85b4a] border-0",
    icon: "bg-white/15 text-white",
    trend: "bg-white/20 text-white",
    title: "text-white/70",
    value: "text-white",
    shadow: "shadow-[0_8px_28px_rgba(153,27,27,0.28)]",
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
  const hasGradient = variant !== "default"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5",
        styles.card,
        styles.shadow,
        hasGradient ? "hover:shadow-[0_8px_28px_rgba(0,0,0,0.22)]" : "shadow-sm hover:shadow-md",
        className
      )}
    >
      {/* Decorative circles on gradient tiles */}
      {hasGradient && (
        <>
          <div className="pointer-events-none absolute -right-5 -top-5 size-24 rounded-full bg-white/[0.12]" />
          <div className="pointer-events-none absolute bottom-[-28px] right-5 size-16 rounded-full bg-white/[0.07]" />
        </>
      )}

      {/* Top row: icon + trend */}
      <div className="relative flex items-center justify-between">
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
      <div className="relative mt-4">
        <p className={cn("text-[30px] font-extrabold leading-none tracking-tighter", styles.value)}>
          {value}
        </p>
        <p className={cn("mt-1.5 text-[10.5px] font-semibold uppercase tracking-wider", styles.title)}>
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
