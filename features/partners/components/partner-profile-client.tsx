"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Activity,
  FileText,
  Megaphone,
  Globe,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { SearchableInput } from "@/components/shared/searchable-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  getPartnerDetail,
  getPartnerActivity,
  updatePartnerStatus,
  updatePartner,
  deletePartner,
  type UpdatePartnerData,
} from "@/features/partners/api"
import type {
  PartnerDetail,
  PartnerActivity,
} from "@/features/partners/types"
import { formatTableDate } from "@/lib/table/table-utils"
import { cn } from "@/lib/utils"
import {
  PARTNER_CATEGORY_OPTIONS,
  PARTNER_COUNTRY_OPTIONS,
  formatPartnerLocation,
  getPartnerRegions,
  parsePartnerLocation,
} from "@/lib/constants/admin-form-options"
import { isValidPhoneNumber, normalizePhoneValue } from "@/lib/phone"

function getInitials(p: PartnerDetail): string {
  const first = p.first_name?.[0] ?? ""
  const last = p.last_name?.[0] ?? ""
  if (first || last) return `${first}${last}`.toUpperCase()
  return p.email[0].toUpperCase()
}

function getDisplayName(p: PartnerDetail): string {
  const full = [p.first_name, p.last_name].filter(Boolean).join(" ")
  return full || p.name || p.email
}

function accountBadgeVariant(status: string) {
  switch (status) {
    case "active":
      return "default" as const
    case "suspended":
      return "destructive" as const
    default:
      return "outline" as const
  }
}

function verificationBadgeVariant(status: string) {
  switch (status) {
    case "verified":
      return "default" as const
    case "pending_review":
      return "outline" as const
    case "rejected":
      return "destructive" as const
    default:
      return "secondary" as const
  }
}

function partnerStatusBadgeVariant(status: string) {
  switch (status) {
    case "active":
      return "default" as const
    case "pending_activation":
      return "outline" as const
    case "suspended":
      return "destructive" as const
    default:
      return "secondary" as const
  }
}

function campaignStatusBadgeVariant(status: string) {
  switch (status) {
    case "active":
      return "default" as const
    case "completed":
      return "secondary" as const
    case "paused":
    case "draft":
      return "outline" as const
    default:
      return "secondary" as const
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function PartnerProfileClient({ partnerId }: { partnerId: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const partnerQuery = useQuery({
    queryKey: queryKeys.partners.detail(partnerId),
    queryFn: () => getPartnerDetail(partnerId),
  })

  const activityQuery = useQuery({
    queryKey: queryKeys.partners.activity(partnerId),
    queryFn: () => getPartnerActivity(partnerId),
  })

  const invalidatePartner = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.partners.detail(partnerId),
    })
    // Also refresh partners list & stats since name/status may have changed
    queryClient.invalidateQueries({ queryKey: ["partners"] })
    queryClient.invalidateQueries({ queryKey: queryKeys.overview.stats })
  }

  const statusMutation = useMutation({
    mutationFn: (status: "active" | "pending_activation" | "suspended") =>
      updatePartnerStatus(partnerId, status),
    onSuccess: () => {
      invalidatePartner()
      toast.success("Partner status updated")
    },
    onError: () => toast.error("Failed to update partner status"),
  })

  const editMutation = useMutation({
    mutationFn: (data: UpdatePartnerData) => updatePartner(partnerId, data),
    onSuccess: () => {
      invalidatePartner()
      setEditOpen(false)
      toast.success("Partner profile updated")
    },
    onError: () => toast.error("Failed to update partner"),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deletePartner(partnerId),
    onSuccess: () => {
      // Invalidate everything partner-related before navigating away
      queryClient.invalidateQueries({ queryKey: ["partners"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.overview.stats })
      queryClient.invalidateQueries({ queryKey: queryKeys.overview.alerts })
      toast.success("Partner deleted")
      router.push("/partners")
    },
    onError: () => toast.error("Failed to delete partner"),
  })

  if (partnerQuery.isLoading) return <ProfileSkeleton />

  if (partnerQuery.isError || !partnerQuery.data) {
    return (
      <div className="space-y-4">
        <Link href="/partners">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Partners
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Failed to load partner profile.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => partnerQuery.refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const partner = partnerQuery.data
  const activity = activityQuery.data ?? []
  const documents = partner.documents ?? []
  const campaigns = partner.campaigns ?? []

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/partners">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Partners
        </Button>
      </Link>

      {/* Profile header */}
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20 text-lg">
            <AvatarImage src={partner.image ?? undefined} alt={getDisplayName(partner)} />
            <AvatarFallback className="text-lg">{getInitials(partner)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold">{getDisplayName(partner)}</h1>
              {partner.organization_name && (
                <p className="text-sm text-muted-foreground">{partner.organization_name}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={accountBadgeVariant(partner.account_status)}>
                {partner.account_status}
              </Badge>
              <Badge variant={verificationBadgeVariant(partner.verification_status)}>
                {partner.verification_status.replace("_", " ")}
              </Badge>
              <Badge variant={partnerStatusBadgeVariant(partner.partner_status ?? "pending_activation")}>
                {(partner.partner_status ?? "pending_activation").replace("_", " ")}
              </Badge>
              {partner.email_verified && (
                <Badge variant="outline" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Email verified
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {partner.email}
              </span>
              {partner.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {partner.phone}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Joined {formatTableDate(partner.created_at)}
              </span>
              {partner.language && (
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  {partner.language}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 sm:flex-col">
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
            {partner.partner_status !== "active" && (
              <Button
                size="sm"
                onClick={() => statusMutation.mutate("active")}
                disabled={statusMutation.isPending}
              >
                Activate
              </Button>
            )}
            {partner.partner_status !== "suspended" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => statusMutation.mutate("suspended")}
                disabled={statusMutation.isPending}
              >
                Suspend
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{campaigns.length}</p>
              <p className="text-xs text-muted-foreground">Campaigns</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{documents.length}</p>
              <p className="text-xs text-muted-foreground">Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activity.length}</p>
              <p className="text-xs text-muted-foreground">Activities</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns" className="gap-1.5">
            <Megaphone className="h-3.5 w-3.5" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Campaigns tab */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <EmptyState icon={Megaphone} message="No campaigns yet" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Target Farmers</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.title}</TableCell>
                          <TableCell>
                            <Badge variant={campaignStatusBadgeVariant(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {campaign.connected_farmers_target?.toLocaleString() ?? "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {campaign.budget_minor != null
                              ? `${campaign.currency ?? "₹"}${(campaign.budget_minor / 100).toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {campaign.starts_at ? formatTableDate(campaign.starts_at) : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {campaign.ends_at ? formatTableDate(campaign.ends_at) : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatTableDate(campaign.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verification Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <EmptyState icon={FileText} message="No documents uploaded" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uploaded</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">
                            {doc.file_url ? (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {doc.file_name}
                              </a>
                            ) : (
                              doc.file_name
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.doc_key}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatBytes(doc.size_bytes)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                doc.status === "approved"
                                  ? "default"
                                  : doc.status === "rejected"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatTableDate(doc.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {activityQuery.isLoading ? (
                <TableSkeleton />
              ) : activity.length === 0 ? (
                <EmptyState icon={Activity} message="No activity recorded" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activity.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.action}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {a.success ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-red-500" />
                              )}
                              <Badge variant={a.success ? "default" : "destructive"}>
                                {a.success ? "Success" : "Failed"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {a.ip_address ?? "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatTableDate(a.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit sheet */}
      <EditPartnerSheet
        partner={partner}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(data) => editMutation.mutate(data)}
        isPending={editMutation.isPending}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete partner</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {getDisplayName(partner)} and all their data including
              campaigns, documents, and activity history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete partner"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ── Edit sheet ── */

function EditPartnerSheet({
  partner,
  open,
  onOpenChange,
  onSave,
  isPending,
}: {
  partner: PartnerDetail
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: UpdatePartnerData) => void
  isPending: boolean
}) {
  const initialLocation = parsePartnerLocation((partner as Record<string, unknown>).location as string | undefined)
  const [firstName, setFirstName] = useState(partner.first_name ?? "")
  const [lastName, setLastName] = useState(partner.last_name ?? "")
  const [phone, setPhone] = useState(normalizePhoneValue(partner.phone))
  const [orgName, setOrgName] = useState(partner.organization_name ?? "")
  const [category, setCategory] = useState((partner as Record<string, unknown>).category as string ?? "general")
  const [country, setCountry] = useState(initialLocation.country)
  const [region, setRegion] = useState(initialLocation.region)
  const [language, setLanguage] = useState(partner.language ?? "")
  const [verificationStatus, setVerificationStatus] = useState(partner.verification_status)
  const [accountStatus, setAccountStatus] = useState(partner.account_status)

  // Reset form when partner data changes
  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      const nextLocation = parsePartnerLocation((partner as Record<string, unknown>).location as string | undefined)
      setFirstName(partner.first_name ?? "")
      setLastName(partner.last_name ?? "")
      setPhone(normalizePhoneValue(partner.phone))
      setOrgName(partner.organization_name ?? "")
      setCategory((partner as Record<string, unknown>).category as string ?? "general")
      setCountry(nextLocation.country)
      setRegion(nextLocation.region)
      setLanguage(partner.language ?? "")
      setVerificationStatus(partner.verification_status)
      setAccountStatus(partner.account_status)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidPhoneNumber(phone)) { toast.error("Phone number must contain 10 to 15 digits"); return }
    const location = formatPartnerLocation(country, region)
    onSave({
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      phone: phone || undefined,
      organization_name: orgName || undefined,
      category: category || undefined,
      location: location || undefined,
      language: language || undefined,
      verification_status: verificationStatus !== partner.verification_status ? verificationStatus : undefined,
      account_status: accountStatus !== partner.account_status ? accountStatus : undefined,
    })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Partner</SheetTitle>
          <SheetDescription>
            Update partner profile information.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
          <FormField label="First name">
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </FormField>
          <FormField label="Last name">
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </FormField>
          <FormField label="Phone">
            <PhoneInput
              value={phone}
              onChange={(value) => setPhone(value || "")}
              defaultCountry="IN"
              international
              placeholder="Enter a phone number"
            />
          </FormField>
          <FormField label="Organization">
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </FormField>
          <FormField label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {PARTNER_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Country">
              <select
                value={country}
                onChange={(e) => {
                  const nextCountry = e.target.value
                  setCountry(nextCountry)
                  if (region && !getPartnerRegions(nextCountry).includes(region)) {
                    setRegion("")
                  }
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select country</option>
                {PARTNER_COUNTRY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </FormField>
            <FormField label="State / Region">
              <SearchableInput
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder={country ? "Select or search region" : "Choose country first"}
                disabled={!country}
                options={getPartnerRegions(country).map((option) => ({ value: option }))}
              />
            </FormField>
          </div>
          <FormField label="Language">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Not set</option>
              <option value="en">English</option>
              <option value="bn">Bengali</option>
              <option value="es">Spanish</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="hi">Hindi</option>
            </select>
          </FormField>
          <FormField label="Verification status">
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value as typeof verificationStatus)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="unverified">Unverified</option>
              <option value="pending_review">Pending review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </FormField>
          <FormField label="Account status">
            <select
              value={accountStatus}
              onChange={(e) => setAccountStatus(e.target.value as typeof accountStatus)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleOpen(false)}>
              Cancel
            </Button>
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

/* ── Skeletons & empty states ── */

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-36" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ComponentType<{ className?: string }>
  message: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Icon className="mb-2 h-8 w-8 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
