import type { SortingState } from "@tanstack/react-table"
import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  type UrlKeys,
} from "nuqs"

const DEFAULT_PAGE_SIZE = 10

export function createTableSearchParams(options?: {
  defaultPageSize?: number
  defaultSort?: string
  urlKeys?: Partial<TableUrlKeys>
}) {
  const parsers = {
    pageIndex: parseAsIndex.withDefault(0),
    pageSize: parseAsInteger
      .withDefault(options?.defaultPageSize ?? DEFAULT_PAGE_SIZE),
    globalFilter: parseAsString.withDefault(""),
    sort: parseAsString.withDefault(options?.defaultSort ?? "updatedAt.desc"),
  }

  const urlKeys: UrlKeys<typeof parsers> = {
    pageIndex: options?.urlKeys?.pageIndex ?? "page",
    pageSize: options?.urlKeys?.pageSize ?? "pageSize",
    globalFilter: options?.urlKeys?.globalFilter ?? "q",
    sort: options?.urlKeys?.sort ?? "sort",
  }

  return {
    parsers,
    urlKeys,
  }
}

export function parseSortingState(
  value: string,
  fallbackColumnId = "updatedAt"
): SortingState {
  const [columnId, direction] = value.split(".")

  return [
    {
      id: columnId || fallbackColumnId,
      desc: direction !== "asc",
    },
  ]
}

type TableUrlKeys = {
  pageIndex: string
  pageSize: string
  globalFilter: string
  sort: string
}
