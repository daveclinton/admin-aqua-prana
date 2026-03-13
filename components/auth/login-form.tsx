"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { PasswordField } from "@/components/auth/password-field"
import { OtpVerifyForm } from "@/components/auth/otp-verify-form"
import { useLogin } from "@/features/auth/hooks/use-login"
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react"

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
      <div className="grid gap-[7px]">
        <label
          htmlFor="email"
          className="text-[11.5px] font-semibold uppercase tracking-wider text-white/55"
        >
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-[13px] top-1/2 size-[15px] -translate-y-1/2 text-white/30" />
          <input
            id="email"
            type="email"
            placeholder="admin@aquaprana.com"
            autoComplete="email"
            required
            className="h-auto w-full rounded-[10px] border-[1.5px] border-white/[0.12] bg-white/[0.07] px-3.5 py-3 pl-10 text-[13.5px] text-white outline-none transition-all placeholder:text-white/30 focus:border-[rgba(45,200,120,0.6)] focus:bg-white/[0.11]"
            {...register("email", { required: true })}
          />
        </div>
      </div>

      <div className="grid gap-[7px]">
        <label
          htmlFor="password"
          className="text-[11.5px] font-semibold uppercase tracking-wider text-white/55"
        >
          Password
        </label>
        <PasswordField
          id="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          icon={
            <Lock className="pointer-events-none absolute left-[13px] top-1/2 size-[15px] -translate-y-1/2 text-white/30" />
          }
          {...register("password", { required: true })}
        />
      </div>

      {error && (
        <div className="rounded-[9px] border border-red-400/40 bg-red-500/15 px-3.5 py-2.5 text-[12.5px] text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="mt-2 w-full rounded-[10px] bg-gradient-to-br from-[#2d8c5a] to-[#3cb87a] px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_6px_20px_rgba(45,140,90,0.45)] transition-all hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {loginMutation.isPending ? (
          <Loader2 className="mx-auto size-4 animate-spin" />
        ) : (
          <span className="flex items-center justify-center gap-1">
            Sign In
            <ArrowRight className="size-4" />
          </span>
        )}
      </button>
    </form>
  )
}
