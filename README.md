Here's the full picture from the aqua-prana-website backend:

  ---
  Backend Auth System

  The service uses Better Auth with Bearer token auth (not cookies):
  - Access token: 60 min TTL
  - Refresh token: 30 days, one-time use, stored as SHA256 hash
  - Roles: farmer | partner | admin
  - Base URL: https://aquaprana.website/ (the API is /api/v1/...)

  ---
  Admin Endpoints We'll Need

  Already exists in the backend:

  - DELETE /api/v1/admin/users/[id] — delete user account (admin only)

  Auth endpoints we'll consume (exist):

  ┌──────────────────────────────────────┬──────────────────────────┐
  │               Endpoint               │         Purpose          │
  ├──────────────────────────────────────┼──────────────────────────┤
  │ POST /api/v1/auth/login              │ Login (with role:        │
  │                                      │ "admin")                 │
  ├──────────────────────────────────────┼──────────────────────────┤
  │ POST /api/v1/auth/logout             │ Logout                   │
  ├──────────────────────────────────────┼──────────────────────────┤
  │ POST /api/v1/auth/token/refresh      │ Refresh access token     │
  ├──────────────────────────────────────┼──────────────────────────┤
  │ GET /api/v1/auth/me                  │ Get current admin        │
  │                                      │ profile                  │
  ├──────────────────────────────────────┼──────────────────────────┤
  │ PATCH /api/v1/auth/me                │ Update admin profile     │
  ├──────────────────────────────────────┼──────────────────────────┤
  │ POST /api/v1/auth/password/forgot    │ Forgot password          │
  ├──────────────────────────────────────┼──────────────────────────┤
  │ POST                                 │ Verify reset OTP         │
  │ /api/v1/auth/password/verify-code    │                          │
  ├──────────────────────────────────────┼──────────────────────────┤
  │ POST /api/v1/auth/password/reset     │ Reset password           │
  ├──────────────────────────────────────┼──────────────────────────┤
  │ POST /api/v1/auth/password/change    │ Change password          │
  │                                      │ (authenticated)          │
  ├──────────────────────────────────────┼──────────────────────────┤
  │ POST /api/v1/auth/2fa/toggle         │ Toggle 2FA               │
  ├──────────────────────────────────────┼──────────────────────────┤
  │ POST /api/v1/auth/login/2fa/verify   │ Verify 2FA during login  │
  └──────────────────────────────────────┴──────────────────────────┘

  Endpoints the admin dashboard will need (likely need to be built on
  the backend):

  ┌─────────────┬─────────────────────────────────┬────────────────┐
  │  Category   │            Endpoint             │    Purpose     │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │ Users/Farme │                                 │ List all users │
  │ rs          │ GET /api/v1/admin/users         │  with filters/ │
  │             │                                 │ pagination     │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ GET /api/v1/admin/users/[id]    │ Get user       │
  │             │                                 │ detail         │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │                                 │ Update user    │
  │             │ PATCH /api/v1/admin/users/[id]  │ (suspend,      │
  │             │                                 │ verify, change │
  │             │                                 │  role)         │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │                                 │ User stats     │
  │             │ GET /api/v1/admin/users/stats   │ (total,        │
  │             │                                 │ active, new    │
  │             │                                 │ signups)       │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │ Partners    │ GET /api/v1/admin/partners      │ List partners  │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ PATCH /api/v1/admin/partners/[i │ Approve/activa │
  │             │ d]/activate                     │ te partner     │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │ Verificatio │ GET /api/v1/admin/verifications │ List pending   │
  │ n/KYC       │                                 │ verifications  │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ PATCH /api/v1/admin/verificatio │ Approve/reject │
  │             │ ns/[id]                         │  verification  │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ GET /api/v1/admin/verifications │ View submitted │
  │             │ /[id]/documents                 │  docs          │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │ Marketplace │ GET /api/v1/admin/marketplace/p │ All products   │
  │             │ roducts                         │                │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ PATCH /api/v1/admin/marketplace │ Approve/flag/r │
  │             │ /products/[id]                  │ emove product  │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ GET /api/v1/admin/marketplace/o │ All orders     │
  │             │ rders                           │                │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │ Forum       │ GET /api/v1/admin/forum/posts   │ All posts (fla │
  │ Moderation  │                                 │ gged/reported) │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ DELETE                          │ Remove post    │
  │             │ /api/v1/admin/forum/posts/[id]  │                │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ PATCH                           │ Pin/lock post  │
  │             │ /api/v1/admin/forum/posts/[id]  │                │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │ Analytics   │ GET /api/v1/admin/analytics/ove │ KPI dashboard  │
  │             │ rview                           │ data           │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ GET                             │ User growth    │
  │             │ /api/v1/admin/analytics/users   │ metrics        │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ GET /api/v1/admin/analytics/mar │ Marketplace    │
  │             │ ketplace                        │ metrics        │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ GET                             │ AquaGPT usage  │
  │             │ /api/v1/admin/analytics/aquagpt │ stats          │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │ Communicati │ POST /api/v1/admin/notification │ Send           │
  │ on          │ s/broadcast                     │ notifications  │
  │             │                                 │ to users       │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ GET /api/v1/admin/notifications │ Sent           │
  │             │ /history                        │ notification   │
  │             │                                 │ history        │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │ Audit       │ GET /api/v1/admin/audit-logs    │ View audit     │
  │             │                                 │ trail          │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │ Billing     │ GET                             │ Billing/subscr │
  │             │ /api/v1/admin/billing/overview  │ iption data    │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │ Team        │ GET /api/v1/admin/team          │ Admin team     │
  │             │                                 │ members        │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ POST /api/v1/admin/team/invite  │ Invite admin   │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │ Support     │ GET                             │ Support        │
  │             │ /api/v1/admin/support/tickets   │ tickets        │
  ├─────────────┼─────────────────────────────────┼────────────────┤
  │             │ PATCH /api/v1/admin/support/tic │ Respond/resolv │
  │             │ kets/[id]                       │ e ticket       │
  └─────────────┴─────────────────────────────────┴────────────────┘

  ---
  Recommended Architecture for the Admin API Client

  Since the backend uses Bearer tokens (not cookies), we need a
  server-side proxy in our Next.js admin app to:
  1. Keep tokens in httpOnly cookies (secure, not exposed to JS)
  2. Handle token refresh transparently
  3. Avoid CORS issues

  Browser → Next.js API routes (proxy) → aqua-prana-website API

  Want me to start building the API client + proxy setup now? I'll
  create:
  1. lib/api/client.ts — server-side fetch wrapper with auth headers
  2. lib/auth/session.ts — cookie-based token storage (httpOnly)
  3. app/api/auth/ route handlers — proxy login/logout/refresh to the
  backend
  4. middleware.ts — protect dashboard routes, auto-refresh tokens

✻ Baked for 2m 10s

Build passes. Here's the full auth integration summary:

  API functions (features/auth/api/)

  ┌─────────────────────┬────────────────────────────────────────────┐
  │        File         │                 Functions                  │
  ├─────────────────────┼────────────────────────────────────────────┤
  │ get-current-user.ts │ getCurrentUser()                           │
  ├─────────────────────┼────────────────────────────────────────────┤
  │ login.ts            │ login(), verify2FA(), logout()             │
  ├─────────────────────┼────────────────────────────────────────────┤
  │ update-profile.ts   │ updateProfile()                            │
  ├─────────────────────┼────────────────────────────────────────────┤
  │ password.ts         │ changePassword(), forgotPassword(),        │
  │                     │ verifyResetCode(), resetPassword()         │
  ├─────────────────────┼────────────────────────────────────────────┤
  │ two-factor.ts       │ toggle2FA()                                │
  └─────────────────────┴────────────────────────────────────────────┘

  Hooks (features/auth/hooks/)

  ┌──────────────────────┬───────────────────────────────────────────┐
  │         Hook         │               What it does                │
  ├──────────────────────┼───────────────────────────────────────────┤
  │ useCurrentUser()     │ Fetches admin profile, 10min stale        │
  ├──────────────────────┼───────────────────────────────────────────┤
  │ useLogin()           │ Login mutation, redirects to /overview    │
  ├──────────────────────┼───────────────────────────────────────────┤
  │ useLogout()          │ Logout mutation, clears cache, redirects  │
  │                      │ to /login                                 │
  ├──────────────────────┼───────────────────────────────────────────┤
  │ useUpdateProfile()   │ Updates profile, sets cache directly (no  │
  │                      │ refetch)                                  │
  ├──────────────────────┼───────────────────────────────────────────┤
  │ useChangePassword()  │ Change password mutation                  │
  ├──────────────────────┼───────────────────────────────────────────┤
  │ useToggle2FA()       │ Toggle 2FA, updates cached user           │
  ├──────────────────────┼───────────────────────────────────────────┤
  │ useForgotPassword()  │ Forgot password mutation                  │
  ├──────────────────────┼───────────────────────────────────────────┤
  │ useVerifyResetCode() │ Verify OTP code mutation                  │
  ├──────────────────────┼───────────────────────────────────────────┤
  │ useResetPassword()   │ Reset password mutation                   │
  └──────────────────────┴───────────────────────────────────────────┘

  All hooks go through the catch-all proxy (/api/proxy/v1/...) which
  attaches the Bearer token from httpOnly cookies automatically. Ready
  for UI integration.

✻ Baked for 1m 57s

────────────────────────────────────────────────────────────────────────
❯                                           
────────────────────────────────────────────────────────────────────────
  ⏵⏵ accept edits on (shift+tab to cycle)
                                                                        
