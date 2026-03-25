"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Lock } from "lucide-react"
import { PasswordField } from "@/components/auth/password-field"
import { useResetPassword } from "@/features/auth/hooks/use-reset-password"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const resetToken = searchParams.get("token") ?? ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const resetMutation = useResetPassword()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    resetMutation.mutate(
      {
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
      {
        onSuccess: () => router.push("/login"),
        onError: (err) => setError(err.message),
      }
    )
  }

  if (!resetToken) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-white/45">
          Invalid or missing reset token. Please request a new password reset.
        </p>
        <button
          onClick={() => router.push("/forgot-password")}
          className="rounded-[10px] border-[1.5px] border-white/[0.12] bg-white/[0.07] px-4 py-2.5 text-sm font-medium text-white/75 transition-all hover:bg-white/[0.13]"
        >
          Request new code
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-[7px]">
        <label
          htmlFor="new-password"
          className="text-[11.5px] font-semibold uppercase tracking-wider text-white/55"
        >
          New password
        </label>
        <PasswordField
          id="new-password"
          placeholder="Enter new password"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-auto rounded-[10px] border-[1.5px] border-white/[0.12] bg-white/[0.07] px-3.5 py-3 text-[13.5px] text-white placeholder:text-white/30 focus-visible:border-[rgba(45,200,120,0.6)] focus-visible:bg-white/[0.11] focus-visible:ring-0"
          icon={
            <Lock className="pointer-events-none absolute left-[13px] top-1/2 size-[15px] -translate-y-1/2 text-white/30" />
          }
        />
      </div>

      <div className="grid gap-[7px]">
        <label
          htmlFor="confirm-password"
          className="text-[11.5px] font-semibold uppercase tracking-wider text-white/55"
        >
          Confirm password
        </label>
        <PasswordField
          id="confirm-password"
          placeholder="Confirm new password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-auto rounded-[10px] border-[1.5px] border-white/[0.12] bg-white/[0.07] px-3.5 py-3 text-[13.5px] text-white placeholder:text-white/30 focus-visible:border-[rgba(45,200,120,0.6)] focus-visible:bg-white/[0.11] focus-visible:ring-0"
          icon={
            <Lock className="pointer-events-none absolute left-[13px] top-1/2 size-[15px] -translate-y-1/2 text-white/30" />
          }
        />
      </div>

      {error && (
        <div className="rounded-[9px] border border-red-400/40 bg-red-500/15 px-3.5 py-2.5 text-[12.5px] text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={resetMutation.isPending}
        className="w-full rounded-[10px] bg-gradient-to-br from-[#2d8c5a] to-[#3cb87a] px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_6px_20px_rgba(45,140,90,0.45)] transition-all hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {resetMutation.isPending ? (
          <Loader2 className="mx-auto size-4 animate-spin" />
        ) : (
          "Reset password"
        )}
      </button>
    </form>
  )
}
