import Image from "next/image"
import type { Metadata } from "next"
import { APP_NAME, APP_DESCRIPTION, APP_LOGO } from "@/lib/constants/app"

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: `${APP_NAME} ${APP_DESCRIPTION}`,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="flex min-h-svh flex-col"
      style={{
        backgroundImage: "url('/flip-white-bg.png')",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="flex items-center gap-2 p-6">
        <Image
          src={APP_LOGO}
          alt={APP_NAME}
          width={32}
          height={32}
          unoptimized
          className="size-8 rounded-lg"
        />
        <span className="text-sm font-semibold">{APP_NAME}</span>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-sm rounded-xl border bg-background/80 p-8 shadow-sm backdrop-blur-sm">
          {children}
        </div>
      </div>
      <footer className="p-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  )
}
