 Batch 2: Partners + Verifications (next)                                                              
                                                                                                        
  ┌────────┬────────────────────────────────────────────┬───────────────────────────────┐               
  │ Method │                  Endpoint                  │            Purpose            │               
  ├────────┼────────────────────────────────────────────┼───────────────────────────────┤               
  │ GET    │ /api/v1/admin/partners                     │ List partners with pagination │               
  ├────────┼────────────────────────────────────────────┼───────────────────────────────┤               
  │ GET    │ /api/v1/admin/partners/[id]                │ Partner detail                │               
  ├────────┼────────────────────────────────────────────┼───────────────────────────────┤               
  │ PATCH  │ /api/v1/admin/partners/[id]/activate       │ Approve/activate partner      │
  ├────────┼────────────────────────────────────────────┼───────────────────────────────┤
  │ GET    │ /api/v1/admin/verifications                │ List pending verifications    │               
  ├────────┼────────────────────────────────────────────┼───────────────────────────────┤               
  │ GET    │ /api/v1/admin/verifications/[id]           │ Verification detail           │               
  ├────────┼────────────────────────────────────────────┼───────────────────────────────┤               
  │ GET    │ /api/v1/admin/verifications/[id]/documents │ KYC documents                 │               
  ├────────┼────────────────────────────────────────────┼───────────────────────────────┤               
  │ PATCH  │ /api/v1/admin/verifications/[id]           │ Approve/reject verification   │
  └────────┴────────────────────────────────────────────┴───────────────────────────────┘

  Batch 3: Marketplace

  ┌────────┬─────────────────────────────────────────┬─────────────────────┐
  │ Method │                Endpoint                 │       Purpose       │
  ├────────┼─────────────────────────────────────────┼─────────────────────┤
  │ GET    │ /api/v1/admin/marketplace/products      │ List products       │
  ├────────┼─────────────────────────────────────────┼─────────────────────┤
  │ GET    │ /api/v1/admin/marketplace/products/[id] │ Product detail      │
  ├────────┼─────────────────────────────────────────┼─────────────────────┤
  │ PATCH  │ /api/v1/admin/marketplace/products/[id] │ Approve/flag/remove │
  ├────────┼─────────────────────────────────────────┼─────────────────────┤
  │ GET    │ /api/v1/admin/marketplace/orders        │ List orders         │
  ├────────┼─────────────────────────────────────────┼─────────────────────┤
  │ GET    │ /api/v1/admin/marketplace/orders/[id]   │ Order detail        │
  └────────┴─────────────────────────────────────────┴─────────────────────┘

  Batch 4: Forum + Audit + Team + More

  ┌──────────────────┬────────────────────────────────┬─────────────────────────────┐
  │      Method      │            Endpoint            │           Purpose           │
  ├──────────────────┼────────────────────────────────┼─────────────────────────────┤
  │ GET              │ /api/v1/admin/forum/posts      │ List/flagged posts          │
  ├──────────────────┼────────────────────────────────┼─────────────────────────────┤
  │ GET/PATCH/DELETE │ /api/v1/admin/forum/posts/[id] │ Post detail/moderate/remove │
  ├──────────────────┼────────────────────────────────┼─────────────────────────────┤
  │ GET              │ /api/v1/admin/audit-logs       │ Audit trail                 │
  ├──────────────────┼────────────────────────────────┼─────────────────────────────┤
  │ GET              │ /api/v1/admin/team             │ Team list                   │
  ├──────────────────┼────────────────────────────────┼─────────────────────────────┤
  │ POST             │ /api/v1/admin/team/invite      │ Invite admin                │
  └──────────────────┴────────────────────────────────┴─────────────────────────────┘

  Batch 5: Analytics detail + Communication + Support + Overview

  ┌────────┬───────────────────────────────────────┬──────────────────────┐
  │ Method │               Endpoint                │       Purpose        │
  ├────────┼───────────────────────────────────────┼──────────────────────┤
  │ GET    │ /api/v1/admin/analytics/users         │ User growth metrics  │
  ├────────┼───────────────────────────────────────┼──────────────────────┤
  │ GET    │ /api/v1/admin/analytics/marketplace   │ Marketplace metrics  │
  ├────────┼───────────────────────────────────────┼──────────────────────┤
  │ GET    │ /api/v1/admin/analytics/aquagpt       │ AquaGPT usage stats  │
  ├────────┼───────────────────────────────────────┼──────────────────────┤
  │ POST   │ /api/v1/admin/notifications/broadcast │ Send notifications   │
  ├────────┼───────────────────────────────────────┼──────────────────────┤
  │ GET    │ /api/v1/admin/notifications/history   │ Notification history │
  ├────────┼───────────────────────────────────────┼──────────────────────┤
  │ GET    │ /api/v1/admin/overview/stats          │ Dashboard stats      │
  ├────────┼───────────────────────────────────────┼──────────────────────┤
  │ GET    │ /api/v1/admin/overview/trends         │ Trend data           │
  ├────────┼───────────────────────────────────────┼──────────────────────┤
  │ GET    │ /api/v1/admin/overview/alerts         │ System alerts        │
  ├────────┼───────────────────────────────────────┼──────────────────────┤
  │ GET    │ /api/v1/admin/overview/activity       │ Activity log         │
  ├────────┼───────────────────────────────────────┼──────────────────────┤
  │ GET    │ /api/v1/admin/support/tickets         │ Support tickets      │
  └────────┴───────────────────────────────────────┴──────────────────────┘

  ---