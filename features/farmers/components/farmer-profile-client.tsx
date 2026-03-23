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
  MapPin,
  ShieldCheck,
  Waves,
  BookOpen,
  Activity,
  User,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  getFarmerDetail,
  getFarmerPonds,
  getFarmerPassbook,
  getFarmerActivity,
  updateFarmer,
  deleteFarmer,
  createPond,
  deletePond,
  type UpdateFarmerData,
  type CreatePondData,
} from "@/features/farmers/api"
import type {
  FarmerDetail,
  FarmerPond,
} from "@/features/farmers/types"
import { formatTableDate } from "@/lib/table/table-utils"
import { cn } from "@/lib/utils"

function getInitials(farmer: FarmerDetail): string {
  const first = farmer.first_name?.[0] ?? ""
  const last = farmer.last_name?.[0] ?? ""
  if (first || last) return `${first}${last}`.toUpperCase()
  return farmer.email[0].toUpperCase()
}

function getDisplayName(farmer: FarmerDetail): string {
  const full = [farmer.first_name, farmer.last_name].filter(Boolean).join(" ")
  return full || farmer.name || farmer.email
}

function accountBadgeVariant(status: string) {
  switch (status) {
    case "active": return "default" as const
    case "suspended": return "destructive" as const
    default: return "outline" as const
  }
}

function verificationBadgeVariant(status: string) {
  switch (status) {
    case "verified": return "default" as const
    case "pending_review": return "outline" as const
    case "rejected": return "destructive" as const
    default: return "secondary" as const
  }
}

function pondStatusBadgeVariant(status: string) {
  switch (status) {
    case "active": return "default" as const
    case "inactive": return "secondary" as const
    default: return "outline" as const
  }
}

export function FarmerProfileClient({ farmerId }: { farmerId: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addPondOpen, setAddPondOpen] = useState(false)
  const [deletePondTarget, setDeletePondTarget] = useState<FarmerPond | null>(null)

  const farmerQuery = useQuery({
    queryKey: queryKeys.farmers.detail(farmerId),
    queryFn: () => getFarmerDetail(farmerId),
  })
  const pondsQuery = useQuery({
    queryKey: queryKeys.farmers.ponds(farmerId),
    queryFn: () => getFarmerPonds(farmerId),
  })
  const passbookQuery = useQuery({
    queryKey: queryKeys.farmers.passbook(farmerId),
    queryFn: () => getFarmerPassbook(farmerId),
  })
  const activityQuery = useQuery({
    queryKey: queryKeys.farmers.activity(farmerId),
    queryFn: () => getFarmerActivity(farmerId),
  })

  const invalidateFarmer = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.farmers.detail(farmerId) })
  }
  const invalidatePonds = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.farmers.ponds(farmerId) })
  }

  const editMutation = useMutation({
    mutationFn: (data: UpdateFarmerData) => updateFarmer(farmerId, data),
    onSuccess: () => {
      invalidateFarmer()
      setEditOpen(false)
      toast.success("Farmer profile updated")
    },
    onError: () => toast.error("Failed to update farmer"),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteFarmer(farmerId),
    onSuccess: () => {
      toast.success("Farmer deleted")
      router.push("/farmers")
    },
    onError: () => toast.error("Failed to delete farmer"),
  })

  const createPondMutation = useMutation({
    mutationFn: (data: CreatePondData) => createPond(farmerId, data),
    onSuccess: () => {
      invalidatePonds()
      setAddPondOpen(false)
      toast.success("Pond created")
    },
    onError: () => toast.error("Failed to create pond"),
  })

  const deletePondMutation = useMutation({
    mutationFn: (pondId: string) => deletePond(farmerId, pondId),
    onSuccess: () => {
      invalidatePonds()
      setDeletePondTarget(null)
      toast.success("Pond deleted")
    },
    onError: () => toast.error("Failed to delete pond"),
  })

  if (farmerQuery.isLoading) return <ProfileSkeleton />

  if (farmerQuery.isError || !farmerQuery.data) {
    return (
      <div className="space-y-4">
        <Link href="/farmers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Farmers
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Failed to load farmer profile.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => farmerQuery.refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const farmer = farmerQuery.data
  const ponds = pondsQuery.data ?? []
  const passbook = passbookQuery.data ?? []
  const activity = activityQuery.data ?? []

  return (
    <div className="space-y-6">
      <Link href="/farmers">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Farmers
        </Button>
      </Link>

      {/* Profile header */}
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20 text-lg">
            <AvatarImage src={farmer.image ?? undefined} alt={getDisplayName(farmer)} />
            <AvatarFallback className="text-lg">{getInitials(farmer)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold">{getDisplayName(farmer)}</h1>
              <p className="text-sm text-muted-foreground">{farmer.role}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={accountBadgeVariant(farmer.account_status)}>{farmer.account_status}</Badge>
              <Badge variant={verificationBadgeVariant(farmer.verification_status)}>
                {farmer.verification_status.replace("_", " ")}
              </Badge>
              {farmer.email_verified && (
                <Badge variant="outline" className="gap-1">
                  <ShieldCheck className="h-3 w-3" /> Email verified
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {farmer.email}
              </span>
              {farmer.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {farmer.phone}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Joined {formatTableDate(farmer.created_at)}
              </span>
              {farmer.organization_name && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> {farmer.organization_name}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 sm:flex-col">
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
            {farmer.account_status === "suspended" ? (
              <Button
                size="sm"
                onClick={() => editMutation.mutate({ account_status: "active" })}
                disabled={editMutation.isPending}
              >
                Reactivate
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => editMutation.mutate({ account_status: "suspended" })}
                disabled={editMutation.isPending}
              >
                Suspend
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400">
              <Waves className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{ponds.length}</p>
              <p className="text-xs text-muted-foreground">Ponds</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{passbook.length}</p>
              <p className="text-xs text-muted-foreground">Passbook Entries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
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
      <Tabs defaultValue="ponds">
        <TabsList>
          <TabsTrigger value="ponds" className="gap-1.5"><Waves className="h-3.5 w-3.5" /> Ponds</TabsTrigger>
          <TabsTrigger value="passbook" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Passbook</TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Activity</TabsTrigger>
        </TabsList>

        {/* Ponds tab */}
        <TabsContent value="ponds">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ponds</CardTitle>
              <CardAction>
                <Button size="sm" onClick={() => setAddPondOpen(true)}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Pond
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {pondsQuery.isLoading ? (
                <TableSkeleton />
              ) : ponds.length === 0 ? (
                <EmptyState icon={Waves} message="No ponds registered" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Depth</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ponds.map((pond) => (
                        <TableRow key={pond.id}>
                          <TableCell className="font-medium">{pond.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {pond.area != null ? `${pond.area} ${pond.area_unit ?? "Ha"}` : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {pond.depth != null ? `${pond.depth} m` : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {pond.latitude != null && pond.longitude != null ? (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {Number(pond.latitude).toFixed(4)}, {Number(pond.longitude).toFixed(4)}
                              </span>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={pondStatusBadgeVariant(pond.status)}>{pond.status}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatTableDate(pond.created_at)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-red-600"
                              onClick={() => setDeletePondTarget(pond)}
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
        </TabsContent>

        {/* Passbook tab */}
        <TabsContent value="passbook">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Passbook</CardTitle>
            </CardHeader>
            <CardContent>
              {passbookQuery.isLoading ? (
                <TableSkeleton />
              ) : passbook.length === 0 ? (
                <EmptyState icon={BookOpen} message="No passbook entries" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Pond</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {passbook.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-muted-foreground">{formatTableDate(entry.entry_date)}</TableCell>
                          <TableCell><Badge variant="outline">{entry.type}</Badge></TableCell>
                          <TableCell className="max-w-[300px] truncate">{entry.description}</TableCell>
                          <TableCell className="text-muted-foreground">{entry.pond ?? "-"}</TableCell>
                          <TableCell className="text-right">
                            {entry.amount != null ? (
                              <span className={cn("font-medium", entry.is_credit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                                {entry.is_credit ? "+" : "-"}{Math.abs(entry.amount).toLocaleString()}
                              </span>
                            ) : "-"}
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
                              {a.success ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-red-500" />}
                              <Badge variant={a.success ? "default" : "destructive"}>{a.success ? "Success" : "Failed"}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{a.ip_address ?? "-"}</TableCell>
                          <TableCell className="text-muted-foreground">{formatTableDate(a.created_at)}</TableCell>
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

      {/* Edit farmer sheet */}
      <EditFarmerSheet
        farmer={farmer}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(data) => editMutation.mutate(data)}
        isPending={editMutation.isPending}
      />

      {/* Add pond sheet */}
      <AddPondSheet
        open={addPondOpen}
        onOpenChange={setAddPondOpen}
        onSave={(data) => createPondMutation.mutate(data)}
        isPending={createPondMutation.isPending}
      />

      {/* Delete farmer dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete farmer</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {getDisplayName(farmer)} and all their data including
              ponds, passbook entries, and activity history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => deleteMutation.mutate()}>
              {deleteMutation.isPending ? "Deleting..." : "Delete farmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete pond dialog */}
      <AlertDialog open={!!deletePondTarget} onOpenChange={(open) => !open && setDeletePondTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete pond</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the pond &quot;{deletePondTarget?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deletePondTarget && deletePondMutation.mutate(deletePondTarget.id)}
            >
              {deletePondMutation.isPending ? "Deleting..." : "Delete pond"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ── Edit farmer sheet ── */

function EditFarmerSheet({
  farmer,
  open,
  onOpenChange,
  onSave,
  isPending,
}: {
  farmer: FarmerDetail
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: UpdateFarmerData) => void
  isPending: boolean
}) {
  const [firstName, setFirstName] = useState(farmer.first_name ?? "")
  const [lastName, setLastName] = useState(farmer.last_name ?? "")
  const [phone, setPhone] = useState(farmer.phone ?? "")
  const [orgName, setOrgName] = useState(farmer.organization_name ?? "")
  const [language, setLanguage] = useState(farmer.language ?? "")
  const [accountStatus, setAccountStatus] = useState(farmer.account_status)
  const [verificationStatus, setVerificationStatus] = useState(farmer.verification_status)

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setFirstName(farmer.first_name ?? "")
      setLastName(farmer.last_name ?? "")
      setPhone(farmer.phone ?? "")
      setOrgName(farmer.organization_name ?? "")
      setLanguage(farmer.language ?? "")
      setAccountStatus(farmer.account_status)
      setVerificationStatus(farmer.verification_status)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: UpdateFarmerData = {}
    if (firstName !== (farmer.first_name ?? "")) data.first_name = firstName || undefined
    if (lastName !== (farmer.last_name ?? "")) data.last_name = lastName || undefined
    if (phone !== (farmer.phone ?? "")) data.phone = phone || undefined
    if (orgName !== (farmer.organization_name ?? "")) data.organization_name = orgName || undefined
    if (language !== (farmer.language ?? "")) data.language = language || undefined
    if (accountStatus !== farmer.account_status) data.account_status = accountStatus as UpdateFarmerData["account_status"]
    if (verificationStatus !== farmer.verification_status) data.verification_status = verificationStatus as UpdateFarmerData["verification_status"]
    if (!Object.keys(data).length) { onOpenChange(false); return }
    onSave(data)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Farmer</SheetTitle>
          <SheetDescription>Update farmer profile details.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
          <FormField label="First name">
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </FormField>
          <FormField label="Last name">
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </FormField>
          <FormField label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormField>
          <FormField label="Organization">
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </FormField>
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
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleOpen(false)}>Cancel</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

/* ── Add pond sheet ── */

function AddPondSheet({
  open,
  onOpenChange,
  onSave,
  isPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CreatePondData) => void
  isPending: boolean
}) {
  const [name, setName] = useState("")
  const [area, setArea] = useState("")
  const [areaUnit, setAreaUnit] = useState("Ha")
  const [depth, setDepth] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setName("")
      setArea("")
      setAreaUnit("Ha")
      setDepth("")
      setLatitude("")
      setLongitude("")
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error("Pond name is required"); return }
    onSave({
      name: name.trim(),
      area: area ? Number(area) : undefined,
      area_unit: areaUnit,
      depth: depth ? Number(depth) : undefined,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
    })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Pond</SheetTitle>
          <SheetDescription>Create a new pond for this farmer.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
          <FormField label="Pond name *">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Pond" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Area">
              <Input type="number" step="0.01" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. 2.5" />
            </FormField>
            <FormField label="Unit">
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Ha">Hectares</option>
                <option value="acres">Acres</option>
                <option value="sq m">Sq meters</option>
              </select>
            </FormField>
          </div>
          <FormField label="Depth (meters)">
            <Input type="number" step="0.01" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="e.g. 1.5" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Latitude">
              <Input type="number" step="0.000001" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g. 17.385" />
            </FormField>
            <FormField label="Longitude">
              <Input type="number" step="0.000001" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g. 78.486" />
            </FormField>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Creating..." : "Create pond"}
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

function EmptyState({ icon: Icon, message }: { icon: React.ComponentType<{ className?: string }>; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Icon className="mb-2 h-8 w-8 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
