import type { Metadata } from "next"
import Image from "next/image"
import { APP_NAME, APP_DESCRIPTION, APP_LOGO } from "@/lib/constants/app"
import { BubbleSphere } from "@/components/auth/bubble-sphere"

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
    <div className="flex h-svh bg-[linear-gradient(135deg,#0f2318_0%,#1b3d27_45%,#0e2a1c_100%)] font-sans">
      {/* LEFT — full-bleed bubble canvas */}
      <div className="relative hidden min-w-0 flex-1 overflow-hidden lg:block">
        <BubbleSphere />
      </div>

      {/* RIGHT — login card panel */}
      <div className="flex w-full flex-shrink-0 items-center justify-center border-l border-white/[0.07] bg-[rgba(10,26,17,0.72)] px-9 py-10 backdrop-blur-[18px] lg:w-[440px]">
        <div className="w-full max-w-[360px]">
          {/* Brand */}
          <div className="mb-9 flex items-center gap-3.5">
            <div className="flex size-[46px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] shadow-[0_6px_20px_rgba(45,140,90,0.45)]">
              <Image
                src={APP_LOGO}
                alt={APP_NAME}
                width={46}
                height={46}
                unoptimized
                className="size-[46px] object-cover"
              />
            </div>
            <div>
              <div className="text-[22px] font-extrabold leading-tight tracking-tight text-white">
                Aquaprana
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-widest text-emerald-300/70">
                Admin Portal
              </div>
            </div>
          </div>

          {/* Page content */}
          {children}

          {/* Footer */}
          <p className="mt-7 text-center text-[11px] text-white/20">
            &copy; {new Date().getFullYear()} Aquaprana
          </p>
        </div>
      </div>
    </div>
  )
}
