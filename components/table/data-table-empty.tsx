import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DataTableEmptyProps = {
  title?: string
  description?: string
}

export function DataTableEmpty({
  title = "No results found",
  description = "Try adjusting your search or filters.",
}: DataTableEmptyProps) {
  return (
    <Card className="border-dashed bg-muted/20">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
