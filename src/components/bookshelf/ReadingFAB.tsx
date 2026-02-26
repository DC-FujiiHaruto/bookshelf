'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BookOpen, X } from 'lucide-react'
import FloatingTimer from '@/components/timer/FloatingTimer'
import type { Book } from '@/types/book'

type Props = {
  books: Book[]
  userId: string
}

const STATUS_LABEL: Record<string, string> = {
  want_to_read: '積読',
  reading: '読中',
}

export default function ReadingFAB({ books, userId }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeBook, setActiveBook] = useState<Book | null>(null)

  const readableBooks = books.filter(
    (b) => b.status === 'want_to_read' || b.status === 'reading'
  )

  const handleSelectBook = (book: Book) => {
    setActiveBook(book)
    setDrawerOpen(false)
  }

  return (
    <>
      {/* FABボタン（タイマー非表示のときのみ表示） */}
      {!activeBook && (
        <button
          onClick={() => setDrawerOpen((o) => !o)}
          aria-label="読書を開始する"
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
            drawerOpen
              ? 'bg-amber-700 rotate-45'
              : 'bg-amber-500 hover:bg-amber-400'
          }`}
        >
          <BookOpen className="w-6 h-6 text-white" strokeWidth={2} />
        </button>
      )}

      {/* 本の選択ドロワー */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed bottom-24 right-6 z-50 w-72 bg-amber-900 border border-amber-700/80 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-amber-800/60 border-b border-amber-700/50">
              <span className="text-amber-100 font-semibold text-sm">読む本を選ぶ</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-amber-400 hover:text-amber-200 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {readableBooks.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BookOpen className="w-8 h-8 text-amber-700 mx-auto mb-2" strokeWidth={1.2} />
                <p className="text-amber-400 text-sm">積読・読中の本がありません</p>
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto divide-y divide-amber-800/50">
                {readableBooks.map((book) => (
                  <li key={book.id}>
                    <button
                      onClick={() => handleSelectBook(book)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-800/50 transition-colors text-left"
                    >
                      <div className="w-8 h-11 relative flex-shrink-0 rounded overflow-hidden bg-amber-800">
                        {book.cover_image_url ? (
                          <Image
                            src={book.cover_image_url}
                            alt={book.title}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-amber-100 text-sm font-medium truncate">{book.title}</p>
                        <p className="text-amber-500 text-xs truncate">{book.author}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                          book.status === 'reading'
                            ? 'bg-green-900/60 text-green-300'
                            : 'bg-amber-950 text-amber-500'
                        }`}
                      >
                        {STATUS_LABEL[book.status]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* フローティングタイマー */}
      {activeBook && (
        <FloatingTimer
          book={activeBook}
          userId={userId}
          onClose={() => setActiveBook(null)}
        />
      )}
    </>
  )
}
