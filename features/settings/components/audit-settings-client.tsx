"use client"

import { useState } from "react"
import { Download, Search, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuditLogs } from "@/features/settings/hooks/use-audit-logs"
import { cn } from "@/lib/utils"

export function AuditSettingsClient() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const pageSize = 10

  const { data, isLoading } = useAuditLogs({
    search: search || undefined,
    limit: pageSize,
    offset: page * pageSize,
  })

  const logs = data?.logs ?? []
  const total = data?.total ?? 0

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Audit Log</CardTitle>
              <CardDescription>
                Recent activity on your account.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search actions, email, IP..."
              className="h-9 rounded-full pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="-mx-6">
                <Table>
                  <TableHeader className="bg-[#f1f5ef]">
                    <TableRow className="hover:bg-[#f1f5ef]">
                      <TableHead className="px-6">Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead className="px-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="px-6 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(entry.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.action}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {entry.user_name ?? entry.email}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {entry.ip_address}
                        </TableCell>
                        <TableCell className="px-6">
                          {entry.success ? (
                            <Badge
                              variant="outline"
                              className="gap-1 rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                            >
                              <CheckCircle className="size-3" />
                              Success
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="gap-1 rounded-full border-red-200 bg-red-50 text-red-600"
                            >
                              <XCircle className="size-3" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {logs.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          No audit log entries found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {total > pageSize && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Showing {page * pageSize + 1}–
                    {Math.min((page + 1) * pageSize, total)} of {total}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-full px-3"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-full px-3"
                      disabled={(page + 1) * pageSize >= total}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
