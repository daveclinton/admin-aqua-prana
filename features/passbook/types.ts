export type PassbookEntryDTO = {
  id: string
  type: string
  description: string
  pond: string | null
  amount: number | null
  is_credit: boolean
  notes: string | null
  entry_date: string
  created_at: string
  user_id: string
  user_email: string
  user_name: string | null
  first_name: string | null
  last_name: string | null
}

export type PassbookEntryRow = {
  id: string
  type: string
  description: string
  pond: string
  amount: number | null
  isCredit: boolean
  userName: string
  userEmail: string
  entryDate: string
}
