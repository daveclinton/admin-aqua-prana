"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  src?: string | null
  name?: string | null
  email?: string
  className?: string
}

function getInitials(name?: string | null, email?: string) {
  if (name) {
    const parts = name.split(" ").filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return parts[0]?.[0]?.toUpperCase() ?? "?"
  }
  return email?.[0]?.toUpperCase() ?? "?"
}

export function UserAvatar({ src, name, email, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("size-8", className)}>
      {src ? <AvatarImage src={src} alt={name ?? email ?? "User"} /> : null}
      <AvatarFallback className="text-xs font-medium">
        {getInitials(name, email)}
      </AvatarFallback>
    </Avatar>
  )
}
