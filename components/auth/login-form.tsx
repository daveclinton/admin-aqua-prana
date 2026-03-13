"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordField } from "@/components/auth/password-field"
import { OtpVerifyForm } from "@/components/auth/otp-verify-form"
import { useLogin } from "@/features/auth/hooks/use-login"
import { Loader2 } from "lucide-react"

interface LoginFormValues {
  email: string
  password: string
}

export function LoginForm() {
  const { register, handleSubmit } = useForm<LoginFormValues>()
  const loginMutation = useLogin()
  const [error, setError] = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)

  const onSubmit = (data: LoginFormValues) => {
    setError(null)
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        if ("data" in res && "challenge_id" in res.data) {
          setChallengeId(res.data.challenge_id)
        }
      },
      onError: (err) => {
        setError(err.message)
      },
    })
  }

  if (challengeId) {
    return (
      <OtpVerifyForm
        challengeId={challengeId}
        onBack={() => setChallengeId(null)}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="email" className="text-xs font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="admin@aquaprana.com"
          autoComplete="email"
          required
          {...register("email", { required: true })}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="password" className="text-xs font-medium">
          Password
        </label>
        <PasswordField
          id="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          {...register("password", { required: true })}
        />
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending && (
          <Loader2 className="animate-spin" />
        )}
        Sign in
      </Button>
    </form>
  )
}
