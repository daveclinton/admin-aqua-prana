"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useCurrentUser } from "@/features/auth/hooks/use-current-user"
import { useUpdateProfile } from "@/features/auth/hooks/use-update-profile"
import type { UpdateProfileRequest } from "@/types/auth"

export function ProfileSettingsClient() {
  const { data: user, isLoading } = useCurrentUser()
  const updateMutation = useUpdateProfile()

  const [form, setForm] = useState<UpdateProfileRequest>({
    first_name: "",
    middle_name: "",
    last_name: "",
    phone: "",
    organization_name: "",
  })
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? "",
        middle_name: user.middle_name ?? "",
        last_name: user.last_name ?? "",
        phone: user.phone ?? "",
        organization_name: user.organization_name ?? "",
      })
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSaveDialog(true)
  }

  const confirmSave = () => {
    updateMutation.mutate(form, {
      onSuccess: () => {
        toast.success("Profile updated")
        setShowSaveDialog(false)
      },
      onError: (err) => {
        toast.error(err.message)
        setShowSaveDialog(false)
      },
    })
  }

  const handleChange = (field: keyof UpdateProfileRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
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
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Account info (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Your account details. These cannot be changed here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="flex items-center gap-3">
            <div className="grid gap-1.5 flex-1">
              <label className="text-xs font-medium text-muted-foreground">Role</label>
              <Input value={user?.role ?? ""} disabled className="capitalize" />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <div className="flex h-9 items-center">
                <Badge variant={user?.email_verified ? "default" : "outline"}>
                  {user?.email_verified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable profile */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <label htmlFor="first_name" className="text-xs font-medium">
                  First name
                </label>
                <Input
                  id="first_name"
                  placeholder={user?.first_name ?? "Enter first name"}
                  value={form.first_name ?? ""}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="middle_name" className="text-xs font-medium">
                  Middle name
                </label>
                <Input
                  id="middle_name"
                  placeholder={user?.middle_name ?? "Enter middle name"}
                  value={form.middle_name ?? ""}
                  onChange={(e) => handleChange("middle_name", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="last_name" className="text-xs font-medium">
                  Last name
                </label>
                <Input
                  id="last_name"
                  placeholder={user?.last_name ?? "Enter last name"}
                  value={form.last_name ?? ""}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label htmlFor="phone" className="text-xs font-medium">
                  Phone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={user?.phone ?? "Enter phone number"}
                  value={form.phone ?? ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="organization" className="text-xs font-medium">
                  Organization
                </label>
                <Input
                  id="organization"
                  placeholder={user?.organization_name ?? "Enter organization"}
                  value={form.organization_name ?? ""}
                  onChange={(e) => handleChange("organization_name", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-4">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="animate-spin" />
              )}
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </form>

      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save profile changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile information will be updated across the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && (
                <Loader2 className="animate-spin" />
              )}
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
