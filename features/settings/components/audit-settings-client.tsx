"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const auditEntries = [
  { time: "Today 10:32 AM", action: "Profile updated", actor: "admin@aquaprana.com" },
  { time: "Today 9:15 AM", action: "Login — MacBook Pro / Chrome", actor: "admin@aquaprana.com" },
  { time: "Yesterday 3:45 PM", action: "Farmer suspended — bce Farmer", actor: "admin@aquaprana.com" },
  { time: "Yesterday 1:22 PM", action: "Password changed", actor: "admin@aquaprana.com" },
  { time: "Mar 22, 2:00 PM", action: "Two-factor authentication enabled", actor: "admin@aquaprana.com" },
] as const

export function AuditSettingsClient() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Audit Log</CardTitle>
              <CardDescription>
                Recent activity on your account.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader className="bg-[#f1f5ef]">
              <TableRow className="hover:bg-[#f1f5ef]">
                <TableHead className="px-4">Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="px-4">Actor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditEntries.map((entry, i) => (
                <TableRow key={i}>
                  <TableCell className="px-4 text-sm text-muted-foreground">{entry.time}</TableCell>
                  <TableCell className="font-medium">{entry.action}</TableCell>
                  <TableCell className="px-4 text-sm text-muted-foreground">{entry.actor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
