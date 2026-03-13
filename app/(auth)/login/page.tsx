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
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="mt-1.5 text-[13px] text-white/45">
          Smart aquaculture management for prawn farms
        </p>
      </div>
      <LoginForm />
      <div className="mt-2.5 text-right">
        <Link
          href="/forgot-password"
          className="text-xs font-medium text-emerald-300/70 underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>
    </>
  )
}
