export interface OverviewStats {
  totalFarmers: number
  totalPartners: number
  activePonds: number
  dailyActiveUsers: number
  farmersGrowth: number
  partnersGrowth: number
  pondsGrowth: number
  dauGrowth: number
}

export interface CriticalAlert {
  id: string
  type: string
  severity: "critical" | "warning" | "info"
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
}

export interface ActivityItem {
  id: string
  action: string
  userId: string
  email: string
  details: string
  timestamp: string
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "down"
  services: {
    name: string
    status: "up" | "degraded" | "down"
    latencyMs: number
  }[]
  lastChecked: string
}
