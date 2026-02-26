'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ReadingNote } from '@/types/session'

type Props = {
  bookId: string
  userId: string
  initialNotes: ReadingNote[]
}

export default function ReadingNotes({ bookId, userId, initialNotes }: Props) {
  const [notes, setNotes] = useState<ReadingNote[]>(initialNotes)
  const [content, setContent] = useState('')
  const [page, setPage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleAdd = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('reading_notes')
      .insert({
        book_id: bookId,
        user_id: userId,
        content: content.trim(),
        page_number: page ? Number(page) : null,
      })
      .select()
      .single()
    setSubmitting(false)
    if (data) {
      setNotes((prev) =>
        [...prev, data].sort((a, b) => (a.page_number ?? 9999) - (b.page_number ?? 9999))
      )
      setContent('')
      setPage('')
    }
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('reading_notes').delete().eq('id', id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-2">
      <p className="text-amber-400 text-xs font-semibold">付箋メモ</p>

      {notes.length > 0 && (
        <ul className="space-y-1 max-h-32 overflow-y-auto">
          {notes.map((note) => (
            <li key={note.id} className="flex items-start gap-2 bg-amber-900/30 rounded-lg px-2 py-1.5">
              {note.page_number && (
                <span className="text-amber-500 text-xs flex-shrink-0">p.{note.page_number}</span>
              )}
              <span className="text-amber-200 text-xs flex-1">{note.content}</span>
              <button
                onClick={() => handleDelete(note.id)}
                className="text-amber-700 hover:text-red-400 text-xs flex-shrink-0"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="number"
          value={page}
          onChange={(e) => setPage(e.target.value)}
          placeholder="p."
          className="w-12 bg-amber-950 text-amber-100 border border-amber-700 rounded px-2 py-1 text-xs focus:outline-none"
        />
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="メモを追加..."
          className="flex-1 bg-amber-950 text-amber-100 border border-amber-700 rounded px-2 py-1 text-xs focus:outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={submitting || !content.trim()}
          className="bg-amber-700 hover:bg-amber-600 text-white text-xs px-2 py-1 rounded transition-colors disabled:opacity-50"
        >
          追加
        </button>
      </div>
    </div>
  )
}
