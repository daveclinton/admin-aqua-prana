import type { SortingState, Updater } from "@tanstack/react-table"

export function formatTableDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

export function getSortingValue(
  sorting: SortingState,
  fallback = "updatedAt.desc"
) {
  const activeSort = sorting[0]

  if (!activeSort) {
    return fallback
  }

  return `${activeSort.id}.${activeSort.desc ? "desc" : "asc"}`
}

export function resolveUpdater<T>(updater: Updater<T>, current: T) {
  if (typeof updater === "function") {
    return (updater as (previousState: T) => T)(current)
  }

  return updater
}
