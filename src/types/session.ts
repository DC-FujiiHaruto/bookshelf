export type ReadingSession = {
  id: string
  book_id: string
  user_id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  pages_read: number | null
}

export type ReadingNote = {
  id: string
  book_id: string
  user_id: string
  page_number: number | null
  content: string
  created_at: string
}
