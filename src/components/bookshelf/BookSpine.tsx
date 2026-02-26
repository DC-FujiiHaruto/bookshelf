'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import type { Book } from '@/types/book'

type Props = {
  book: Book
  threshold: number
  onClick: () => void
}

// 背表紙の色（表紙なし時にタイトルから決定）
const SPINE_COLORS = [
  'bg-red-700', 'bg-blue-700', 'bg-green-700', 'bg-purple-700',
  'bg-orange-700', 'bg-teal-700', 'bg-rose-700', 'bg-indigo-700',
]

function getSpineColor(title: string) {
  let hash = 0
  for (const c of title) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return SPINE_COLORS[Math.abs(hash) % SPINE_COLORS.length]
}

function getDaysElapsed(createdAt: string) {
  return Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
}

export default function BookSpine({ book, threshold, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: book.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const days = getDaysElapsed(book.created_at)
  const showBadge = book.status !== 'read' && days >= threshold
  const badgeColor = days >= 90 ? 'bg-red-500' : 'bg-yellow-400'

  const progress =
    book.total_pages && book.total_pages > 0 && book.current_page != null
      ? Math.min(100, Math.round((book.current_page / book.total_pages) * 100))
      : null

  // ステータス別スタイル
  const statusStyle =
    book.status === 'reading'
      ? 'ring-2 ring-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
      : ''

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`relative flex-shrink-0 w-10 h-32 rounded-sm cursor-grab active:cursor-grabbing touch-none hover:scale-105 hover:-translate-y-1 transition-transform ${statusStyle} ${isDragging ? 'opacity-40 z-50 scale-105' : ''}`}
      title={book.title}
    >
      {book.cover_image_url ? (
        <Image
          src={book.cover_image_url}
          alt={book.title}
          fill
          className="object-cover rounded-sm"
          sizes="40px"
        />
      ) : (
        <div
          className={`w-full h-full ${getSpineColor(book.title)} rounded-sm flex items-center justify-center p-1`}
        >
          <span
            className="text-white text-[9px] font-medium leading-tight text-center break-all"
            style={{ writingMode: 'vertical-rl' }}
          >
            {book.title.slice(0, 12)}
          </span>
        </div>
      )}

      {/* 積読日数バッジ */}
      {showBadge && (
        <span
          className={`absolute -top-1 -right-1 ${badgeColor} text-white text-[8px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow`}
        >
          {days >= 99 ? '99+' : days}
        </span>
      )}

      {/* 読書進捗バー（背表紙下部） */}
      {progress !== null && book.status === 'reading' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 rounded-b-sm overflow-hidden">
          <div
            className="h-full bg-amber-300 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </button>
  )
}
