import type { Metadata } from "next"
import Link from "next/link"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { APP_NAME } from "@/lib/constants/app"

export const metadata: Metadata = {
  title: "Reset Password",
  description: `Set a new password for your ${APP_NAME} account.`,
}

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Reset password
        </h1>
        <p className="mt-1.5 text-[13px] text-white/45">
          Enter a new password for your account.
        </p>
      </div>
      <ResetPasswordForm />
      <p className="mt-6 text-center text-xs text-white/40">
        Back to{" "}
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
