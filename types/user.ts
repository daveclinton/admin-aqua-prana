import type {
  UserRole,
  AccountStatus,
  VerificationStatus,
} from "./auth"

export interface AdminUser {
  id: string
  email: string
  name: string | null
  image: string | null
  emailVerified: boolean
  role: UserRole
  accountStatus: AccountStatus
  verificationStatus: VerificationStatus
  firstName: string | null
  middleName: string | null
  lastName: string | null
  phone: string | null
  language: string
  organizationName: string | null
  partnerStatus: string | null
  twoFactorEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface UserFilters {
  search?: string
  role?: UserRole
  accountStatus?: AccountStatus
  verificationStatus?: VerificationStatus
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}
