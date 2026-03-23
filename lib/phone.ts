import { isPossiblePhoneNumber } from "react-phone-number-input"

export function normalizePhoneValue(value: string | null | undefined) {
  const trimmed = (value ?? "").trim()
  if (!trimmed) return ""

  const digits = trimmed.replace(/\D/g, "")
  if (!digits) return ""
  if (trimmed.startsWith("+")) return `+${digits}`
  if (digits.length === 10) return `+91${digits}`
  if (digits.length > 10) return `+${digits}`
  return ""
}

export function isValidPhoneNumber(value: string) {
  if (!value.trim()) return true
  return isPossiblePhoneNumber(value)
}
