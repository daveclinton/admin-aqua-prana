import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DataTableErrorProps = {
  title?: string
  description?: string
  onRetry?: () => void
}

export function DataTableError({
  title = "Unable to load table data",
  description = "The request failed. Try refreshing the table.",
  onRetry,
}: DataTableErrorProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="rounded-full bg-destructive/10 p-2 text-destructive">
          <AlertTriangle className="size-4" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{description}</p>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
