"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { PasswordField } from "@/components/auth/password-field"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentUser } from "@/features/auth/hooks/use-current-user"
import { useChangePassword } from "@/features/auth/hooks/use-change-password"
import { useToggle2FA } from "@/features/auth/hooks/use-toggle-2fa"

export function SecuritySettingsClient() {
  const { data: user, isLoading } = useCurrentUser()
  const changePasswordMutation = useChangePassword()
  const toggle2FAMutation = useToggle2FA()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [pending2FAState, setPending2FAState] = useState(false)

  const validatePassword = () => {
    setPasswordError(null)

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return false
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return false
    }

    return true
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return
    setShowPasswordDialog(true)
  }

  const confirmChangePassword = () => {
    changePasswordMutation.mutate(
      {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password changed successfully")
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
          setShowPasswordDialog(false)
        },
        onError: (err) => {
          setPasswordError(err.message)
          setShowPasswordDialog(false)
        },
      }
    )
  }

  const handleToggle2FA = (enabled: boolean) => {
    setPending2FAState(enabled)
    setShow2FADialog(true)
  }

  const confirmToggle2FA = () => {
    toggle2FAMutation.mutate(
      { enabled: pending2FAState, channel: "email" },
      {
        onSuccess: (result) => {
          toast.success(
            result.two_factor_enabled
              ? "Two-factor authentication enabled"
              : "Two-factor authentication disabled"
          )
          setShow2FADialog(false)
        },
        onError: (err) => {
          toast.error(err.message)
          setShow2FADialog(false)
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Change password */}
      <form onSubmit={handlePasswordSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change password</CardTitle>
            <CardDescription>
              Update your password. You will need your current password to make changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <label htmlFor="current-pw" className="text-xs font-medium">
                Current password
              </label>
              <PasswordField
                id="current-pw"
                placeholder="Enter current password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label htmlFor="new-pw" className="text-xs font-medium">
                  New password
                </label>
                <PasswordField
                  id="new-pw"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="confirm-pw" className="text-xs font-medium">
                  Confirm new password
                </label>
                <PasswordField
                  id="confirm-pw"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            {passwordError && (
              <p className="text-xs text-destructive">{passwordError}</p>
            )}
          </CardContent>
          <CardFooter className="justify-end border-t pt-4">
            <Button type="submit" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending && (
                <Loader2 className="animate-spin" />
              )}
              Change password
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Two-factor authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Two-factor authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security. When enabled, you will be asked for a
            6-digit code sent to your email each time you sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Email-based 2FA</p>
                <p className="text-xs text-muted-foreground">
                  {user?.two_factor_enabled
                    ? "A verification code is sent to your email on each login."
                    : "Enable to receive a verification code on each login."}
                </p>
              </div>
            </div>
            <Switch
              checked={user?.two_factor_enabled ?? false}
              onCheckedChange={handleToggle2FA}
              disabled={toggle2FAMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Change password confirmation */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change your password?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current session will remain active, but you will need to use
              your new password the next time you sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmChangePassword}
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending && (
                <Loader2 className="animate-spin" />
              )}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2FA toggle confirmation */}
      <AlertDialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending2FAState
                ? "Enable two-factor authentication?"
                : "Disable two-factor authentication?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending2FAState
                ? "You will receive a 6-digit verification code to your email address each time you sign in."
                : "Your account will no longer require a verification code on sign in. This makes your account less secure."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggle2FA}
              disabled={toggle2FAMutation.isPending}
              className={pending2FAState ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
            >
              {toggle2FAMutation.isPending && (
                <Loader2 className="animate-spin" />
              )}
              {pending2FAState ? "Enable" : "Disable"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
