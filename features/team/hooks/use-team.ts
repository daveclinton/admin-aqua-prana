"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import {
  getTeamMembersList,
  getTeamStatsApi,
  inviteMember,
  updateMember,
  removeMember,
  resendInvite,
  getRolesConfig,
  updateRoleConfig,
} from "@/features/team/api/team-api"

export function useTeamMembers(params: {
  search?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ["team", "members", params],
    queryFn: () => getTeamMembersList(params),
  })
}

export function useTeamStats() {
  return useQuery({
    queryKey: ["team", "stats"],
    queryFn: getTeamStatsApi,
  })
}

export function useRolesConfig() {
  return useQuery({
    queryKey: ["team", "roles"],
    queryFn: getRolesConfig,
  })
}

export function useInviteMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inviteMember,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] })
    },
  })
}

export function useUpdateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: Parameters<typeof updateMember>[1] }) =>
      updateMember(memberId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] })
    },
  })
}

export function useRemoveMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] })
    },
  })
}

export function useResendInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: resendInvite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] })
    },
  })
}

export function useUpdateRoleConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateRoleConfig,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team", "roles"] })
    },
  })
}
