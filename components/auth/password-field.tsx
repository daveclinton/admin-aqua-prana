"use client"

import { forwardRef, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

type PasswordFieldProps = React.ComponentProps<"input"> & {
  icon?: React.ReactNode
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ icon, className, ...props }, ref) {
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative">
        {icon}
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={`h-auto w-full rounded-[10px] border-[1.5px] border-white/[0.12] bg-white/[0.07] px-3.5 py-3 text-[13.5px] text-white outline-none transition-all placeholder:text-white/30 focus:border-[rgba(45,200,120,0.6)] focus:bg-white/[0.11] ${icon ? "pl-10 pr-10" : "pr-10"} ${className ?? ""}`}
          {...props}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/35 transition-colors hover:text-white/60"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="size-[15px]" />
          ) : (
            <Eye className="size-[15px]" />
          )}
        </button>
      </div>
    )
  }
)
