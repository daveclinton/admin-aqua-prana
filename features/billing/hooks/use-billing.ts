"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getSubscriptionStats, getInvoiceStats, getSubscriptions, updateSubscription,
  getInvoices, updateInvoice, getPlans, updatePlan, createPlan,
} from "@/features/billing/api/billing-api"

export function useSubscriptionStats() {
  return useQuery({ queryKey: ["billing", "sub-stats"], queryFn: getSubscriptionStats })
}

export function useInvoiceStats() {
  return useQuery({ queryKey: ["billing", "inv-stats"], queryFn: getInvoiceStats })
}

export function useSubscriptions(params?: Parameters<typeof getSubscriptions>[0]) {
  return useQuery({ queryKey: ["billing", "subscriptions", params], queryFn: () => getSubscriptions(params) })
}

export function useInvoices(params?: Parameters<typeof getInvoices>[0]) {
  return useQuery({ queryKey: ["billing", "invoices", params], queryFn: () => getInvoices(params) })
}

export function usePlans() {
  return useQuery({ queryKey: ["billing", "plans"], queryFn: getPlans })
}

export function useUpdateSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateSubscription>[1] }) =>
      updateSubscription(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing"] }),
  })
}

export function useUpdateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateInvoice>[1] }) =>
      updateInvoice(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing"] }),
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updatePlan(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing", "plans"] }),
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing", "plans"] }),
  })
}
