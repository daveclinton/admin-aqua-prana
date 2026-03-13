"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { verify2FA } from "@/features/auth/api/login"
import { queryKeys } from "@/lib/react-query/query-keys"

interface OtpVerifyFormProps {
  challengeId: string
  onBack: () => void
}

export function OtpVerifyForm({ challengeId, onBack }: OtpVerifyFormProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  const verifyMutation = useMutation({
    mutationFn: verify2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
      router.push("/overview")
    },
    onError: (err: Error) => {
      setError(err.message)
      setCode("")
    },
  })

  const handleComplete = (value: string) => {
    setError(null)
    verifyMutation.mutate({ challenge_id: challengeId, code: value })
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/15">
          <ShieldCheck className="size-6 text-emerald-400" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Two-factor authentication
          </h2>
          <p className="text-sm text-white/45">
            Enter the 6-digit code sent to your email.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={setCode}
          onComplete={handleComplete}
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
        className="mx-auto flex w-fit items-center gap-1.5 text-xs font-medium text-white/45 transition-colors hover:text-white/70"
        onClick={onBack}
      >
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </button>
    </div>
  )
}
