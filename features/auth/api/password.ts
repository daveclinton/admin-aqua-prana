import { api } from "@/lib/api/client"
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  VerifyCodeRequest,
  ResetPasswordRequest,
} from "@/types/auth"

export async function changePassword(data: ChangePasswordRequest) {
  return api<{ data: { message: string } }>("/v1/auth/password/change", {
    method: "POST",
    body: data,
  })
}

export async function forgotPassword(data: ForgotPasswordRequest) {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error?.message || "Request failed")
  }

  return json
}

export async function verifyResetCode(data: VerifyCodeRequest) {
  const res = await fetch("/api/auth/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error?.message || "Verification failed")
  }

  return json
}

export async function resetPassword(data: ResetPasswordRequest) {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error?.message || "Reset failed")
  }

  return json
}
