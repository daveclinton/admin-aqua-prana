"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Megaphone, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
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
import { queryKeys } from "@/lib/react-query/query-keys"
import {
  getCampaigns,
  createCampaign,
  deleteCampaign,
  getPartners,
  type CampaignListItem,
  type CreateCampaignData,
} from "@/features/partners/api"
import { formatTableDate } from "@/lib/table/table-utils"

function statusVariant(status: string) {
  switch (status) {
    case "active":
      return "default" as const
    case "completed":
      return "secondary" as const
    case "paused":
      return "outline" as const
    case "draft":
      return "outline" as const
    default:
      return "secondary" as const
  }
}

export function CampaignsTable() {
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CampaignListItem | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.campaigns.all({}),
    queryFn: () => getCampaigns({ pageIndex: 0, pageSize: 100, globalFilter: "" }),
  })

  const campaigns = data?.campaigns ?? []

  const createMutation = useMutation({
    mutationFn: (d: CreateCampaignData) => createCampaign(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
      queryClient.invalidateQueries({ queryKey: ["partners"] })
      setAddOpen(false)
      toast.success("Campaign created")
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to create campaign"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
      queryClient.invalidateQueries({ queryKey: ["partners"] })
      setDeleteTarget(null)
      toast.success("Campaign deleted")
    },
    onError: () => toast.error("Failed to delete campaign"),
  })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Partner Campaigns</CardTitle>
          <CardAction>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Campaign
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Megaphone className="mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm">No campaigns yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Farmers</TableHead>
                    <TableHead className="w-10">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.partner_name}</TableCell>
                      <TableCell>{c.title}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {c.starts_at ? formatTableDate(c.starts_at) : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {c.ends_at ? formatTableDate(c.ends_at) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {c.connected_farmers_target?.toLocaleString() ?? "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-red-600"
                          onClick={() => setDeleteTarget(c)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddCampaignSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={(d) => createMutation.mutate(d)}
        isPending={createMutation.isPending}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete campaign</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete campaign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/* ── Add campaign sheet ── */

function AddCampaignSheet({
  open,
  onOpenChange,
  onSave,
  isPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CreateCampaignData) => void
  isPending: boolean
}) {
  const [partnerId, setPartnerId] = useState("")
  const [title, setTitle] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [farmersTarget, setFarmersTarget] = useState("")
  const [budget, setBudget] = useState("")
  const [currency, setCurrency] = useState("INR")

  // Fetch partners for dropdown
  const { data: partnersData } = useQuery({
    queryKey: queryKeys.partners.all({ size: 200 }),
    queryFn: () => getPartners({ pageIndex: 0, pageSize: 200, globalFilter: "" }),
    enabled: open,
  })
  const partners = partnersData?.rows ?? []

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setPartnerId("")
      setTitle("")
      setStartsAt("")
      setEndsAt("")
      setFarmersTarget("")
      setBudget("")
      setCurrency("INR")
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerId) { toast.error("Select a partner"); return }
    if (!title.trim()) { toast.error("Title is required"); return }
    onSave({
      partner_id: partnerId,
      title: title.trim(),
      starts_at: startsAt || undefined,
      ends_at: endsAt || undefined,
      connected_farmers_target: farmersTarget ? Number(farmersTarget) : undefined,
      budget_minor: budget ? Math.round(Number(budget) * 100) : undefined,
      currency: currency || undefined,
    })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Campaign</SheetTitle>
          <SheetDescription>Create a new partner campaign.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
          <FormField label="Partner *">
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select partner</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Campaign title *">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer Outreach" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start date">
              <Input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </FormField>
            <FormField label="End date">
              <Input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Target farmers">
            <Input type="number" value={farmersTarget} onChange={(e) => setFarmersTarget(e.target.value)} placeholder="e.g. 500" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Budget">
              <Input type="number" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 50000" />
            </FormField>
            <FormField label="Currency">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </FormField>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Creating..." : "Create campaign"}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleOpen(false)}>Cancel</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
