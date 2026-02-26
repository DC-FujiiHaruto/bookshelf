'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BookDetail from './BookDetail'
import type { Book } from '@/types/book'
import type { BookRead } from '@/types/book_read'
import type { ReadingNote } from '@/types/session'

type Props = {
  book: Book
  onClose: () => void
  onDelete: (bookId: string) => void
}

export default function BookDetailWrapper({ book, onClose, onDelete }: Props) {
  const [userId, setUserId] = useState<string | null>(null)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [notes, setNotes] = useState<ReadingNote[]>([])
  const [bookReads, setBookReads] = useState<BookRead[]>([])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)

      // 累計読書時間
      supabase
        .from('reading_sessions')
        .select('duration_seconds')
        .eq('book_id', book.id)
        .not('duration_seconds', 'is', null)
        .then(({ data: sessions }) => {
          const total = (sessions ?? []).reduce((s, r) => s + (r.duration_seconds ?? 0), 0)
          setTotalSeconds(total)
        })

      // 付箋メモ
      supabase
        .from('reading_notes')
        .select('*')
        .eq('book_id', book.id)
        .order('page_number', { ascending: true, nullsFirst: false })
        .then(({ data: n }) => setNotes(n ?? []))

      // 複数回読み記録
      supabase
        .from('book_reads')
        .select('*')
        .eq('book_id', book.id)
        .order('read_number', { ascending: true })
        .then(({ data: r }) => setBookReads((r ?? []) as BookRead[]))
    })
  }, [book.id])

  return (
    <BookDetail
      book={book}
      onClose={onClose}
      onDelete={onDelete}
      userId={userId}
      totalSeconds={totalSeconds}
      notes={notes}
      bookReads={bookReads}
    />
  )
}
