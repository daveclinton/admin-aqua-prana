"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getForumStats,
  getTrendingTopics,
  pinPost,
  getExperts,
  createExpert,
  updateExpert,
  getContentList,
  createContent,
  updateContent,
  getContentStats,
  getContentPerformance,
  getContentCategories,
  createCategory,
  updateCategory,
  getModerationStats,
  getModerationQueue,
  performModerationAction,
} from "@/features/community-forum/api/forum-api"

/* ── Queries ── */

export function useForumStats() {
  return useQuery({ queryKey: ["forum", "stats"], queryFn: getForumStats })
}

export function useTrendingTopics(limit = 5) {
  return useQuery({
    queryKey: ["forum", "trending", limit],
    queryFn: () => getTrendingTopics(limit),
  })
}

export function useExperts(params?: Parameters<typeof getExperts>[0]) {
  return useQuery({
    queryKey: ["forum", "experts", params],
    queryFn: () => getExperts(params),
  })
}

export function useContentList(params?: Parameters<typeof getContentList>[0]) {
  return useQuery({
    queryKey: ["forum", "content", params],
    queryFn: () => getContentList(params),
  })
}

export function useContentStats() {
  return useQuery({ queryKey: ["forum", "content-stats"], queryFn: getContentStats })
}

export function useContentPerformance() {
  return useQuery({ queryKey: ["forum", "content-performance"], queryFn: getContentPerformance })
}

export function useContentCategories() {
  return useQuery({ queryKey: ["forum", "categories"], queryFn: getContentCategories })
}

export function useModerationStats() {
  return useQuery({ queryKey: ["forum", "moderation-stats"], queryFn: getModerationStats })
}

export function useModerationQueue(params?: Parameters<typeof getModerationQueue>[0]) {
  return useQuery({
    queryKey: ["forum", "moderation-queue", params],
    queryFn: () => getModerationQueue(params),
  })
}

/* ── Mutations ── */

export function usePinPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, pinned }: { postId: string; pinned: boolean }) =>
      pinPost(postId, pinned),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum", "trending"] }),
  })
}

export function useCreateExpert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createExpert,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum", "experts"] }),
  })
}

export function useUpdateExpert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateExpert>[1] }) =>
      updateExpert(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum", "experts"] }),
  })
}

export function useCreateContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createContent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forum", "content"] })
      qc.invalidateQueries({ queryKey: ["forum", "content-stats"] })
    },
  })
}

export function useUpdateContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateContent>[1] }) =>
      updateContent(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forum", "content"] })
      qc.invalidateQueries({ queryKey: ["forum", "content-stats"] })
    },
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum", "categories"] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum", "categories"] }),
  })
}

export function useModerationAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: performModerationAction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forum", "moderation-queue"] })
      qc.invalidateQueries({ queryKey: ["forum", "moderation-stats"] })
      qc.invalidateQueries({ queryKey: ["forum", "stats"] })
    },
  })
}
