import type {
  LoginRequest,
  LoginResponse,
  TwoFactorChallengeResponse,
  Verify2FARequest,
} from "@/types/auth"

export async function login(
  data: LoginRequest
): Promise<LoginResponse | TwoFactorChallengeResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error?.message || "Login failed")
  }

  return json
}

export async function verify2FA(data: Verify2FARequest) {
  const res = await fetch("/api/auth/login/2fa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error?.message || "Verification failed")
  }

  return json
}

export async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  })
}
