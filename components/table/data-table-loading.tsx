import { Skeleton } from "@/components/ui/skeleton"

export function DataTableLoading() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="overflow-hidden rounded-2xl border">
        <div className="grid grid-cols-5 gap-3 border-b bg-muted/40 p-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
        <div className="space-y-3 p-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="grid grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((__, cellIndex) => (
                <Skeleton key={cellIndex} className="h-8 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
