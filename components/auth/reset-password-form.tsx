"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
        <p className="text-sm text-muted-foreground">
          Invalid or missing reset token. Please request a new password reset.
        </p>
        <Button variant="outline" onClick={() => router.push("/forgot-password")}>
          Request new code
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="new-password" className="text-xs font-medium">
          New password
        </label>
        <PasswordField
          id="new-password"
          placeholder="Enter new password"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="confirm-password" className="text-xs font-medium">
          Confirm password
        </label>
        <PasswordField
          id="confirm-password"
          placeholder="Confirm new password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={resetMutation.isPending}
      >
        {resetMutation.isPending && (
          <Loader2 className="animate-spin" />
        )}
        Reset password
      </Button>
    </form>
  )
}
