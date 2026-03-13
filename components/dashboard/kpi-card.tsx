import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KpiCardProps = {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: string
  className?: string
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-3.5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {(subtitle || trend) && (
          <p className="mt-0.5 text-[0.625rem] text-muted-foreground">
            {trend && (
              <span className="font-medium text-primary">{trend}</span>
            )}
            {trend && subtitle && " "}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
