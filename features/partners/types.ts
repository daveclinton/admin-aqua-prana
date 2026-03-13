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
}

export type PartnerRow = {
  id: string
  name: string
  email: string
  organization: string
  phone: string
  accountStatus: AccountStatus
  verificationStatus: VerificationStatus
  partnerStatus: string
  createdAt: string
}
