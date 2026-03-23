"use client"

import { useQuery } from "@tanstack/react-query"
import { DollarSign, ShoppingCart, Wallet } from "lucide-react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { queryKeys } from "@/lib/react-query/query-keys"
import { getMarketplaceStats } from "@/features/marketplace/api"
import { ProductsTableClient } from "./products-table-client"
import { OrdersTableClient } from "./orders-table-client"
import { SellersTable } from "./sellers-table"

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `₹${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}K`
  return `₹${amount.toLocaleString()}`
}

export function MarketplaceClient() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.marketplace.stats,
    queryFn: getMarketplaceStats,
    retry: 1,
  })

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-2xl" />
          ))
        ) : (
          <>
            <KpiCard
              title="Total Revenue"
              value={formatCurrency(stats?.total_revenue ?? 0)}
              icon={DollarSign}
              variant="green"
            />
            <KpiCard
              title="Avg Order Value"
              value={formatCurrency(stats?.avg_order_value ?? 0)}
              icon={ShoppingCart}
              variant="teal"
            />
            <KpiCard
              title="Pending Payouts"
              value={formatCurrency(stats?.pending_payouts ?? 0)}
              icon={Wallet}
              variant="amber"
            />
          </>
        )}
      </div>

      {/* Products */}
      <ProductsTableClient />

      {/* Orders */}
      <OrdersTableClient />

      {/* Seller Management */}
      <SellersTable />
    </div>
  )
}
