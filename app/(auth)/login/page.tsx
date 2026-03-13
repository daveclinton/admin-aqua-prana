import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { APP_NAME } from "@/lib/constants/app"

export const metadata: Metadata = {
  title: "Sign In",
  description: `Sign in to your ${APP_NAME} admin account.`,
}

export default function LoginPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your admin account to continue.
        </p>
      </div>
      <LoginForm />
      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link
          href="/forgot-password"
          className="text-primary underline-offset-4 hover:underline"
        >
          Forgot your password?
        </Link>
      </p>
    </>
  )
}
