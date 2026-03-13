import type { Metadata } from "next"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { APP_NAME } from "@/lib/constants/app"

export const metadata: Metadata = {
  title: "Forgot Password",
  description: `Reset your ${APP_NAME} account password.`,
}

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Forgot password?
        </h1>
        <p className="mt-1.5 text-[13px] text-white/45">
          Enter your email and we&apos;ll send you a reset code.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-xs text-white/40">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-300/70 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
