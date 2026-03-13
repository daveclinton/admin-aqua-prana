"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

export function PasswordField({
  ...props
}: React.ComponentProps<"input">) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute right-1.5 top-1/2 -translate-y-1/2"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  )
}
