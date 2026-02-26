'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Trash2, X, CalendarDays, BookOpen } from 'lucide-react'
import ReadingTimer from '@/components/timer/ReadingTimer'
import ReadingNotes from '@/components/notes/ReadingNotes'
import BookReadsHistory from '@/components/bookshelf/BookReadsHistory'
import { localizeGenre } from '@/types/book'
import type { Book } from '@/types/book'
import type { BookRead } from '@/types/book_read'
import type { ReadingNote } from '@/types/session'

type Props = {
  book: Book
  onClose: () => void
  onDelete: (bookId: string) => void
  userId: string | null
  totalSeconds: number
  notes: ReadingNote[]
  bookReads: BookRead[]
}

const STATUS_LABEL: Record<string, string> = {
  want_to_read: '積読',
  reading: '読中',
  read: '読了',
}

function getDaysElapsed(createdAt: string) {
  return Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
}

export default function BookDetail({ book, onClose, onDelete, userId, totalSeconds, notes, bookReads }: Props) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(book.current_page ?? 0)
  const [savingPage, setSavingPage] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`「${book.title}」を削除しますか？`)) return
    const supabase = createClient()
    await supabase.from('books').delete().eq('id', book.id)
    onDelete(book.id)
    router.refresh()
  }

  const handleCurrentPageSave = useCallback(async (page: number) => {
    setSavingPage(true)
    const supabase = createClient()
    await supabase.from('books').update({ current_page: page }).eq('id', book.id)
    setSavingPage(false)
  }, [book.id])

  const days = getDaysElapsed(book.created_at)
  const progress =
    book.total_pages && book.total_pages > 0
      ? Math.min(100, Math.round((currentPage / book.total_pages) * 100))
      : null

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-amber-950 border border-amber-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4 mb-4">
          {/* 表紙 */}
          <div className="flex-shrink-0 w-20 h-28 relative rounded overflow-hidden bg-amber-900">
            {book.cover_image_url ? (
              <Image src={book.cover_image_url} alt={book.title} fill className="object-cover" sizes="80px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-400 text-xs text-center p-1">
                {book.title}
              </div>
            )}
          </div>

          {/* タイトル・著者 */}
          <div className="flex-1 min-w-0">
            <h2 className="text-amber-100 font-bold text-base leading-tight mb-1 line-clamp-3">
              {book.title}
            </h2>
            <Link
              href={`/bookshelf/add?q=${encodeURIComponent(book.author)}`}
              onClick={onClose}
              className="text-amber-400 hover:text-amber-200 text-sm mb-2 block transition-colors"
            >
              {book.author}
            </Link>
            {book.genre && (
              <span className="bg-amber-800 text-amber-300 text-xs px-2 py-0.5 rounded-full">
                {localizeGenre(book.genre)}
              </span>
            )}
          </div>
        </div>

        {/* ステータス・評価 */}
        <div className="flex items-center gap-3 mb-3 text-sm">
          <span className="bg-amber-800 text-amber-200 px-3 py-1 rounded-full">
            {STATUS_LABEL[book.status]}
          </span>
          {book.status !== 'read' && (
            <span className="text-amber-400 text-xs">登録から{days}日</span>
          )}
          {book.rating && (
            <span className="text-yellow-400">
              {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
            </span>
          )}
        </div>

        {book.read_date && (
          <p className="text-amber-400 text-sm mb-2 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            読了日: {book.read_date}
          </p>
        )}

        {book.emotion_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {book.emotion_tags.map((tag) => (
              <span key={tag} className="bg-amber-900 text-amber-300 text-xs px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ページ数・進捗 */}
        {book.total_pages && (
          <div className="mb-3">
            {book.status === 'reading' ? (
              <div className="bg-amber-900/40 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-400">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    読書進捗
                  </span>
                  <span>{book.total_pages}ページ</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={book.total_pages}
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    onBlur={() => handleCurrentPageSave(currentPage)}
                    className="w-20 bg-amber-950 text-amber-100 border border-amber-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-amber-500 text-xs">/ {book.total_pages}p</span>
                  {savingPage && <span className="text-amber-600 text-xs">保存中...</span>}
                </div>
                {progress !== null && (
                  <div>
                    <div className="flex justify-between text-xs text-amber-500 mb-1">
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-amber-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : progress !== null ? (
              <div className="mb-1">
                <div className="flex justify-between text-xs text-amber-500 mb-1">
                  <span>{currentPage} / {book.total_pages}p</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-amber-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {book.impression && (
          <p className="text-amber-300 text-sm bg-amber-900/50 rounded-lg p-3 mb-3 line-clamp-4">
            {book.impression}
          </p>
        )}

        {/* 読書タイマー（読中のみ） */}
        {book.status === 'reading' && userId && (
          <div className="mb-3">
            <ReadingTimer bookId={book.id} userId={userId} totalSeconds={totalSeconds} />
          </div>
        )}

        {/* 付箋メモ（読中・積読） */}
        {book.status !== 'read' && userId && (
          <div className="mb-4">
            <ReadingNotes bookId={book.id} userId={userId} initialNotes={notes} />
          </div>
        )}

        {/* 複数回読み記録 */}
        {userId && (
          <BookReadsHistory
            bookId={book.id}
            userId={userId}
            initialReads={bookReads}
          />
        )}

        {/* ボタン */}
        <div className="flex gap-2">
          <Link
            href={`/bookshelf/${book.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold py-2 rounded-full transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            編集
          </Link>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-900/80 hover:bg-red-900 text-red-300 text-sm font-semibold py-2 rounded-full transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            削除
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 bg-amber-900 hover:bg-amber-800 text-amber-400 text-sm font-semibold py-2 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
