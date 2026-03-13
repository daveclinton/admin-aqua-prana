/**
 * Backend API base URL — the aqua-prana-website service.
 * All requests from our proxy route handlers go here.
 */
export const API_BASE_URL =
  process.env.API_BASE_URL || "https://aquaprana.website"

/**
 * Internal proxy prefix — browser-side fetches hit these,
 * and our Next.js route handlers forward them to the backend.
 */
export const PROXY_PREFIX = "/api/proxy"

/**
 * Auth-related paths (for middleware route matching).
 */
export const AUTH_ROUTES = {
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  unauthorized: "/unauthorized",
} as const

export const DASHBOARD_ROUTES = {
  overview: "/overview",
  farmers: "/farmers",
  partners: "/partners",
  aquagpt: "/aquagpt",
  marketplace: "/marketplace",
  passbook: "/passbook",
  communication: "/communication",
  communityForum: "/community-forum",
  support: "/support",
  analytics: "/analytics",
  billing: "/billing",
  team: "/team",
  settings: "/settings",
} as const

/**
 * Public routes that don't require authentication.
 */
export const PUBLIC_ROUTES = [
  AUTH_ROUTES.login,
  AUTH_ROUTES.forgotPassword,
  AUTH_ROUTES.resetPassword,
  AUTH_ROUTES.unauthorized,
] as const
