export type BookRead = {
  id: string
  book_id: string
  user_id: string
  read_number: number
  read_date: string | null
  rating: number | null
  impression: string | null
  emotion_tags: string[]
  created_at: string
}
