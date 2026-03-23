import type { AccountStatus, VerificationStatus } from "@/types/auth"

export type PartnerDTO = {
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
  partner_status: string | null
  category: string | null
  location: string | null
  campaign_count: number | null
  connected_farmers: number | null
}

export type PartnerRow = {
  id: string
  name: string
  email: string
  phone: string
  category: string
  partnerStatus: string
  location: string
  campaignCount: number
  connectedFarmers: number
  createdAt: string
}

/* ── Detail types ── */

export type PartnerDetail = {
  id: string
  email: string
  name: string | null
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  phone: string | null
  image: string | null
  role: string
  account_status: AccountStatus
  verification_status: VerificationStatus
  partner_status: string | null
  email_verified: boolean
  organization_name: string | null
  two_factor_enabled: boolean
  legal_consent_accepted: boolean
  language: string | null
  created_at: string
  updated_at: string
  verification_profile: Record<string, unknown> | null
  documents: PartnerDocument[]
  campaigns: PartnerCampaign[]
}

export type PartnerDocument = {
  id: string
  doc_key: string
  file_name: string
  mime_type: string
  size_bytes: number
  file_url: string | null
  status: string
  created_at: string
}

export type PartnerCampaign = {
  id: string
  title: string
  status: string
  starts_at: string | null
  ends_at: string | null
  connected_farmers_target: number | null
  budget_minor: number | null
  currency: string | null
  created_at: string
}

export type PartnerActivity = {
  id: string
  action: string
  success: boolean
  ip_address: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}
