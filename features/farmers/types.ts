import type { AccountStatus, VerificationStatus } from "@/types/auth"

export type FarmerDTO = {
  id: string
  email: string
  name: string | null
  image: string | null
  created_at: string
  role: string
  account_status: AccountStatus
  verification_status: VerificationStatus
  first_name: string | null
  last_name: string | null
  phone: string | null
  organization_name: string | null
  pond_count: number
  species: string | null
  alert_count: number
  last_login: string | null
}

export type FarmerRow = {
  id: string
  name: string
  email: string
  region: string
  plan: string
  species: string
  pondCount: number
  avgPondScore: string
  alertCount: number
  lastLogin: string
  accountStatus: AccountStatus
}

/* ── Detail types ── */

export type FarmerDetail = {
  id: string
  email: string
  name: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  image: string | null
  role: string
  account_status: AccountStatus
  verification_status: VerificationStatus
  email_verified: boolean
  created_at: string
  updated_at: string
  organization_name: string | null
  language: string | null
}

export type FarmerPond = {
  id: string
  name: string
  area: number | null
  area_unit: string | null
  depth: number | null
  latitude: number | null
  longitude: number | null
  status: "active" | "inactive" | "archived"
  metadata: Record<string, unknown>
  created_at: string
}

export type FarmerPassbookEntry = {
  id: string
  type: string
  description: string
  pond: string | null
  amount: number | null
  is_credit: boolean
  notes: string | null
  entry_date: string
  created_at: string
}

export type FarmerActivity = {
  id: string
  action: string
  success: boolean
  ip_address: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}
