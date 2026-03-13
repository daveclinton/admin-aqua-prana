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
}

export type FarmerRow = {
  id: string
  name: string
  email: string
  phone: string
  accountStatus: AccountStatus
  verificationStatus: VerificationStatus
  createdAt: string
}
