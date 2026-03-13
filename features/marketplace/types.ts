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
}

export type ProductRow = {
  id: string
  name: string
  category: string
  price: number
  currency: string
  stock: number
  status: string
  sellerName: string
  sellerEmail: string
  createdAt: string
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
  status: string
  total: number
  currency: string
  buyerName: string
  buyerEmail: string
  sellerName: string
  sellerEmail: string
  placedAt: string
}
