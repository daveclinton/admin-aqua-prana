"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getTickets,
  createTicket,
  updateTicket,
  getSupportStats,
  getAgentWorkload,
  getDataRequests,
  updateDataRequest,
} from "@/features/support/api/support-api"

export function useTickets(params?: Parameters<typeof getTickets>[0]) {
  return useQuery({
    queryKey: ["support", "tickets", params],
    queryFn: () => getTickets(params),
  })
}

export function useSupportStats() {
  return useQuery({
    queryKey: ["support", "stats"],
    queryFn: getSupportStats,
  })
}

export function useAgentWorkload() {
  return useQuery({
    queryKey: ["support", "agents"],
    queryFn: getAgentWorkload,
  })
}

export function useDataRequests(params?: Parameters<typeof getDataRequests>[0]) {
  return useQuery({
    queryKey: ["support", "data-requests", params],
    queryFn: () => getDataRequests(params),
  })
}

export function useCreateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support"] })
    },
  })
}

export function useUpdateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTicket>[1] }) =>
      updateTicket(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support"] })
    },
  })
}

export function useUpdateDataRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string } }) =>
      updateDataRequest(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support", "data-requests"] })
    },
  })
}
