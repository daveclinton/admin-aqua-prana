"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertTriangle, Download, ExternalLink, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useDeleteAccount } from "@/features/settings/hooks/use-delete-account"

export function DataPrivacySettingsClient() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [open, setOpen] = useState(false)
  const deleteMutation = useDeleteAccount()

  function handleDelete() {
    if (!password.trim()) {
      toast.error("Please enter your password")
      return
    }

    deleteMutation.mutate(
      { password },
      {
        onSuccess: () => {
          toast.success("Account deleted successfully")
          router.push("/login")
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to delete account. Please check your password."
          )
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data & Privacy</CardTitle>
          <CardDescription>
            Export your data or manage account deletion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full">
              <Download className="size-3.5" />
              Export My Data
            </Button>
            <a
              href="https://aquaprana.website/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="rounded-full">
                <ExternalLink className="size-3.5" />
                Privacy Policy
              </Button>
            </a>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 text-red-500" />
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-red-900">
                    Delete Account
                  </p>
                  <p className="text-xs text-red-700">
                    Deletion is permanent. All data removed within 30 days per
                    GDPR.
                  </p>
                </div>

                <AlertDialog open={open} onOpenChange={setOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-red-300 bg-white text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Your account and all
                        associated data will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                      <label
                        htmlFor="delete-password"
                        className="text-sm font-medium"
                      >
                        Enter your password to confirm
                      </label>
                      <Input
                        id="delete-password"
                        type="password"
                        placeholder="Your current password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setPassword("")}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 text-white hover:bg-red-700"
                        disabled={
                          !password.trim() || deleteMutation.isPending
                        }
                        onClick={(e) => {
                          e.preventDefault()
                          handleDelete()
                        }}
                      >
                        {deleteMutation.isPending
                          ? "Deleting..."
                          : "Delete my account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
