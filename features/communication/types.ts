export type CommStatsDTO = {
  sent_this_month: number
  total_recipients_this_month: number
  opened_this_month: number
  avg_open_rate: number
  total_suppressions: number
  push_suppressions: number
  sms_suppressions: number
  email_suppressions: number
  sms_drafts: number
  sms_scheduled: number
  sms_sent: number
}

export type BroadcastDTO = {
  batch_id: string
  title: string
  body: string
  category: string
  severity: string
  recipient_count: number
  read_count: number
  sent_at: string
}

export type SmsCampaignDTO = {
  id: string
  title: string
  body: string
  audience: string
  status: string
  recipients: number
  delivered: number
  scheduled_for: string | null
  sent_at: string | null
  created_by_name: string
  created_at: string
}

export type SuppressionDTO = {
  id: string
  channel: string
  reason: string
  created_at: string
  farmer_name: string | null
  farmer_email: string
}
