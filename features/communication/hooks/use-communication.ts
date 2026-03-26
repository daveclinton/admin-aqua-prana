"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getCommStats, sendBroadcast, getBroadcastHistory,
  getSmsCampaigns, createSmsCampaign, updateSmsCampaign,
  getSuppressionList, removeSuppression,
} from "@/features/communication/api/communication-api"

export function useCommStats() {
  return useQuery({ queryKey: ["comm", "stats"], queryFn: getCommStats })
}

export function useBroadcastHistory(params?: Parameters<typeof getBroadcastHistory>[0]) {
  return useQuery({ queryKey: ["comm", "history", params], queryFn: () => getBroadcastHistory(params) })
}

export function useSmsCampaigns(params?: Parameters<typeof getSmsCampaigns>[0]) {
  return useQuery({ queryKey: ["comm", "sms", params], queryFn: () => getSmsCampaigns(params) })
}

export function useSuppressionList(params?: Parameters<typeof getSuppressionList>[0]) {
  return useQuery({ queryKey: ["comm", "suppressions", params], queryFn: () => getSuppressionList(params) })
}

export function useSendBroadcast() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: sendBroadcast,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comm"] })
    },
  })
}

export function useCreateSmsCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSmsCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comm", "sms"] }),
  })
}

export function useUpdateSmsCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateSmsCampaign>[1] }) =>
      updateSmsCampaign(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comm", "sms"] }),
  })
}

export function useRemoveSuppression() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: removeSuppression,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comm", "suppressions"] }),
  })
}
