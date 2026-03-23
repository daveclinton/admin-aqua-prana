export type ProductDTO = {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
  currency: string
  stock: number
  unit: string | null
  status: string
  image_urls: string[] | null
  created_at: string
  updated_at: string
  seller_id: string
  seller_email: string
  seller_name: string | null
  seller_organization: string | null
  order_count: number
}

export type ProductRow = {
  id: string
  name: string
  category: string
  price: number
  currency: string
  orderCount: number
  stock: number
  status: string
}

export type OrderDTO = {
  id: string
  status: string
  total: number
  currency: string
  shipping_address: string | null
  notes: string | null
  placed_at: string
  updated_at: string
  buyer_id: string
  buyer_email: string
  buyer_name: string | null
  seller_id: string
  seller_email: string
  seller_name: string | null
}

export type OrderRow = {
  id: string
  details: string
  amount: number
  currency: string
  date: string
  status: string
  seller: string
}

export type SellerDTO = {
  seller_id: string
  seller_name: string
  seller_email: string
  product_count: number
  total_revenue: number
  payout_due: number
  avg_rating: number | null
  status: string
}

export type MarketplaceStats = {
  total_revenue: number
  avg_order_value: number
  pending_payouts: number
}
