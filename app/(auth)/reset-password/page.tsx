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
        <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your reset code and a new password.
        </p>
      </div>
      <ResetPasswordForm />
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Back to{" "}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
