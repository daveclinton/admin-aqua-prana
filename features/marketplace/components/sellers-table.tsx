"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Star, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { queryKeys } from "@/lib/react-query/query-keys"
import { getSellers } from "@/features/marketplace/api"
import { cn } from "@/lib/utils"

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `₹${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}K`
  return `₹${amount.toLocaleString()}`
}

export function SellersTable() {
  const { data: sellers, isLoading } = useQuery({
    queryKey: queryKeys.marketplace.sellers,
    queryFn: getSellers,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Seller Management</CardTitle>
        <CardAction>
          <Button size="sm" asChild>
            <Link href="/partners?action=add-partner">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Onboard Seller
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !sellers || sellers.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No sellers found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Payout Due</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((s) => (
                  <TableRow key={s.seller_id}>
                    <TableCell className="font-medium">{s.seller_name}</TableCell>
                    <TableCell className="tabular-nums">{s.product_count}</TableCell>
                    <TableCell className="tabular-nums font-medium">
                      {formatCurrency(s.total_revenue)}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatCurrency(s.payout_due)}
                    </TableCell>
                    <TableCell>
                      {s.avg_rating != null ? (
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3",
                                  i < Math.floor(s.avg_rating!)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium">{s.avg_rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "Verified" ? "default" : "outline"}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/partners/${s.seller_id}`}>
                          Manage →
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
