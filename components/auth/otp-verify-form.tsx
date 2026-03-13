"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
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
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="size-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Two-factor authentication
          </h2>
          <p className="text-sm text-muted-foreground">
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
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && (
        <p className="text-center text-xs text-destructive">{error}</p>
      )}

      {verifyMutation.isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Verifying...
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mx-auto w-fit"
        onClick={onBack}
      >
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </Button>
    </div>
  )
}
