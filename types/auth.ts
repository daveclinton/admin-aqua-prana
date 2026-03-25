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

// ── Notification Preferences ──────────────────────────────────────
export type NotificationCategory = "alerts" | "tasks" | "system"

export interface NotificationPreference {
  category: NotificationCategory
  enabled: boolean
}

export interface NotificationPreferencesResponse {
  preferences: NotificationPreference[]
}

export interface UpdateNotificationPreferenceRequest {
  category: NotificationCategory
  enabled: boolean
}

// ── Audit Logs ───────────────────────────────────────────────────
export interface AuditLogEntry {
  id: string
  action: string
  user_id: string | null
  email: string
  success: boolean
  ip_address: string
  user_agent: string
  metadata: Record<string, unknown>
  created_at: string
  user_name: string | null
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[]
  total: number
}

export interface GetAuditLogsParams {
  action?: string
  user_id?: string
  success?: string
  search?: string
  limit?: number
  offset?: number
}

// ── Sessions / Devices ───────────────────────────────────────────
export interface SessionDevice {
  id: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
  last_active_at: string
  is_current: boolean
}

export interface SessionsResponse {
  sessions: SessionDevice[]
}

export interface RevokeSessionRequest {
  session_id?: string
  revoke_all_others?: boolean
}

// ── User Preferences ─────────────────────────────────────────────
export interface UserPreferences {
  dark_mode: boolean
  compact_view: boolean
  currency: string
}

export interface UpdatePreferencesRequest {
  dark_mode?: boolean
  compact_view?: boolean
  currency?: string
}

// ── Account Deletion ─────────────────────────────────────────────
export interface DeleteAccountRequest {
  password: string
}

export interface DeleteAccountResponse {
  deleted: true
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
