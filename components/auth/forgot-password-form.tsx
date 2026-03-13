"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Mail, MailCheck } from "lucide-react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useForgotPassword } from "@/features/auth/hooks/use-forgot-password"
import { useVerifyResetCode } from "@/features/auth/hooks/use-reset-password"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"email" | "code">("email")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const forgotMutation = useForgotPassword()
  const verifyMutation = useVerifyResetCode()

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    forgotMutation.mutate(
      { email },
      {
        onSuccess: () => setStep("code"),
        onError: (err) => setError(err.message),
      }
    )
  }

  const handleVerifyCode = (value: string) => {
    setError(null)
    verifyMutation.mutate(
      { email, code: value },
      {
        onSuccess: (res) => {
          const token = res?.data?.reset_token
          if (token) {
            router.push(`/reset-password?token=${token}`)
          }
        },
        onError: (err) => {
          setError(err.message)
          setCode("")
        },
      }
    )
  }

  if (step === "code") {
    return (
      <div className="grid gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/15">
            <MailCheck className="size-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Check your email
            </h2>
            <p className="text-sm text-white/45">
              We sent a 6-digit code to <strong className="text-white/70">{email}</strong>
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            onComplete={handleVerifyCode}
            disabled={verifyMutation.isPending}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="size-10 border-white/[0.12] bg-white/[0.07] text-base text-white data-[active=true]:border-[rgba(45,200,120,0.6)] data-[active=true]:ring-emerald-500/30 [&_.animate-caret-blink]:bg-white" />
              <InputOTPSlot index={1} className="size-10 border-white/[0.12] bg-white/[0.07] text-base text-white data-[active=true]:border-[rgba(45,200,120,0.6)] data-[active=true]:ring-emerald-500/30 [&_.animate-caret-blink]:bg-white" />
              <InputOTPSlot index={2} className="size-10 border-white/[0.12] bg-white/[0.07] text-base text-white data-[active=true]:border-[rgba(45,200,120,0.6)] data-[active=true]:ring-emerald-500/30 [&_.animate-caret-blink]:bg-white" />
            </InputOTPGroup>
            <InputOTPSeparator className="text-white/30" />
            <InputOTPGroup>
              <InputOTPSlot index={3} className="size-10 border-white/[0.12] bg-white/[0.07] text-base text-white data-[active=true]:border-[rgba(45,200,120,0.6)] data-[active=true]:ring-emerald-500/30 [&_.animate-caret-blink]:bg-white" />
              <InputOTPSlot index={4} className="size-10 border-white/[0.12] bg-white/[0.07] text-base text-white data-[active=true]:border-[rgba(45,200,120,0.6)] data-[active=true]:ring-emerald-500/30 [&_.animate-caret-blink]:bg-white" />
              <InputOTPSlot index={5} className="size-10 border-white/[0.12] bg-white/[0.07] text-base text-white data-[active=true]:border-[rgba(45,200,120,0.6)] data-[active=true]:ring-emerald-500/30 [&_.animate-caret-blink]:bg-white" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <div className="rounded-[9px] border border-red-400/40 bg-red-500/15 px-3.5 py-2.5 text-center text-[12.5px] text-red-300">
            {error}
          </div>
        )}

        {verifyMutation.isPending && (
          <div className="flex items-center justify-center gap-2 text-sm text-white/45">
            <Loader2 className="size-4 animate-spin" />
            Verifying...
          </div>
        )}

        <button
          type="button"
          className="mx-auto w-fit text-xs font-medium text-white/45 transition-colors hover:text-white/70"
          onClick={() => {
            setStep("email")
            setCode("")
            setError(null)
          }}
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSendCode} className="grid gap-4">
      <div className="grid gap-[7px]">
        <label
          htmlFor="forgot-email"
          className="text-[11.5px] font-semibold uppercase tracking-wider text-white/55"
        >
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-[13px] top-1/2 size-[15px] -translate-y-1/2 text-white/30" />
          <input
            id="forgot-email"
            type="email"
            placeholder="admin@aquaprana.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-auto w-full rounded-[10px] border-[1.5px] border-white/[0.12] bg-white/[0.07] px-3.5 py-3 pl-10 text-[13.5px] text-white outline-none transition-all placeholder:text-white/30 focus:border-[rgba(45,200,120,0.6)] focus:bg-white/[0.11]"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-[9px] border border-red-400/40 bg-red-500/15 px-3.5 py-2.5 text-[12.5px] text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={forgotMutation.isPending}
        className="w-full rounded-[10px] bg-gradient-to-br from-[#2d8c5a] to-[#3cb87a] px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_6px_20px_rgba(45,140,90,0.45)] transition-all hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {forgotMutation.isPending ? (
          <Loader2 className="mx-auto size-4 animate-spin" />
        ) : (
          "Send reset code"
        )}
      </button>
    </form>
  )
}
