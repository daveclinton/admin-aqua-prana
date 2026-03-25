"use client"

import { forwardRef, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PasswordFieldProps = React.ComponentProps<typeof Input> & {
  /** Pass a fully-positioned icon (e.g. absolute-positioned) or omit for no icon. */
  icon?: React.ReactNode
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ icon, className, ...props }, ref) {
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative">
        {icon}
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(icon ? "pl-10 pr-10" : "pr-10", className)}
          {...props}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
    )
  }
)
