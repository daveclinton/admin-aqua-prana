"use client"

import { Package, ShoppingCart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsTableClient } from "./products-table-client"
import { OrdersTableClient } from "./orders-table-client"

export function MarketplaceClient() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">
            <Package className="mr-1.5 size-3.5" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingCart className="mr-1.5 size-3.5" />
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <ProductsTableClient />
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <OrdersTableClient />
        </TabsContent>
      </Tabs>
    </div>
  )
}
