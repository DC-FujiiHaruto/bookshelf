export type UserProfile = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  is_public: boolean
  tsundoku_threshold_days: number
  created_at: string
}
