"use client"

import { AlertTriangle, Download, ExternalLink, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function DataPrivacySettingsClient() {
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
            <Button variant="outline" className="rounded-full">
              <ExternalLink className="size-3.5" />
              Privacy Policy
            </Button>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 text-red-500" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-red-900">Delete Account</p>
                <p className="text-xs text-red-700">
                  Deletion is permanent. All data removed within 30 days per GDPR.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-red-300 bg-white text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="size-3.5" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
