export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  overview: {
    stats: ["overview", "stats"] as const,
    trends: (range: string) => ["overview", "trends", range] as const,
    alerts: ["overview", "alerts"] as const,
    activity: (filter?: string) => ["overview", "activity", filter] as const,
    systemHealth: ["overview", "system-health"] as const,
  },
  farmers: {
    all: (params?: Record<string, unknown>) => ["farmers", params] as const,
    detail: (id: string) => ["farmers", id] as const,
  },
  partners: {
    all: (params?: Record<string, unknown>) => ["partners", params] as const,
    detail: (id: string) => ["partners", id] as const,
  },
  marketplace: {
    products: (params?: Record<string, unknown>) =>
      ["marketplace", "products", params] as const,
    productDetail: (id: string) =>
      ["marketplace", "products", id] as const,
    orders: (params?: Record<string, unknown>) =>
      ["marketplace", "orders", params] as const,
    orderDetail: (id: string) => ["marketplace", "orders", id] as const,
  },
  forum: {
    posts: (params?: Record<string, unknown>) =>
      ["forum", "posts", params] as const,
    postDetail: (id: string) => ["forum", "posts", id] as const,
  },
  communication: {
    history: (params?: Record<string, unknown>) =>
      ["communication", "history", params] as const,
  },
  support: {
    tickets: (params?: Record<string, unknown>) =>
      ["support", "tickets", params] as const,
    ticketDetail: (id: string) => ["support", "tickets", id] as const,
  },
  analytics: {
    overview: (range?: string) => ["analytics", "overview", range] as const,
    users: (range?: string) => ["analytics", "users", range] as const,
    marketplace: (range?: string) =>
      ["analytics", "marketplace", range] as const,
    aquagpt: (range?: string) => ["analytics", "aquagpt", range] as const,
  },
  billing: {
    overview: ["billing", "overview"] as const,
  },
  team: {
    all: ["team"] as const,
  },
  verifications: {
    all: (params?: Record<string, unknown>) =>
      ["verifications", params] as const,
    detail: (id: string) => ["verifications", id] as const,
    documents: (id: string) => ["verifications", id, "documents"] as const,
  },
  auditLogs: {
    all: (params?: Record<string, unknown>) =>
      ["audit-logs", params] as const,
  },
  passbook: {
    entries: (params?: Record<string, unknown>) =>
      ["passbook", "entries", params] as const,
    summary: ["passbook", "summary"] as const,
  },
} as const
