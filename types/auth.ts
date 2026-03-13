export type UserRole = "farmer" | "partner" | "admin"

export type AccountStatus = "active" | "suspended" | "archived"

export type VerificationStatus =
  | "unverified"
  | "pending_review"
  | "verified"
  | "rejected"

export type Language = "en" | "bn" | "es" | "ta" | "te" | "hi"

/**
 * Shape returned by GET /api/v1/auth/me and PATCH /api/v1/auth/me
 */
export interface CurrentUser {
  id: string
  name: string
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  email: string
  image: string
  phone: string | null
  organization_name: string | null
  role: UserRole
  email_verified: boolean
  two_factor_enabled: boolean
  verification_status: VerificationStatus
  language: Language
}

/**
 * Fields accepted by PATCH /api/v1/auth/me
 */
export interface UpdateProfileRequest {
  first_name?: string
  middle_name?: string | null
  last_name?: string
  phone?: string
  organization_name?: string | null
  image_url?: string
  language?: Language
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: true
  data: {
    user: CurrentUser
    requires_2fa: false
  }
}

export interface TwoFactorChallengeResponse {
  success: true
  data: {
    challenge_id: string
    channel: "email"
  }
}

export interface Verify2FARequest {
  challenge_id: string
  code: string
}

export interface Toggle2FARequest {
  enabled: boolean
  channel?: "email"
}

export interface Toggle2FAResponse {
  two_factor_enabled: boolean
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyCodeRequest {
  email: string
  code: string
}

export interface ResetPasswordRequest {
  reset_token: string
  new_password: string
  confirm_password: string
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: {
    code?: string
    message: string
    details?: unknown
  }
}
