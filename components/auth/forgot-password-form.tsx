"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="size-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Check your email
            </h2>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to <strong>{email}</strong>
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
          onClick={() => {
            setStep("email")
            setCode("")
            setError(null)
          }}
        >
          Use a different email
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSendCode} className="grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="forgot-email" className="text-xs font-medium">
          Email
        </label>
        <Input
          id="forgot-email"
          type="email"
          placeholder="admin@aquaprana.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={forgotMutation.isPending}
      >
        {forgotMutation.isPending && (
          <Loader2 className="animate-spin" />
        )}
        Send reset code
      </Button>
    </form>
  )
}
