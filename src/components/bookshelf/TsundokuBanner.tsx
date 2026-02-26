import { TriangleAlert } from 'lucide-react'
import type { Book } from '@/types/book'

type Props = {
  books: Book[]
  threshold: number
}

export default function TsundokuBanner({ books, threshold }: Props) {
  const now = new Date()
  const warned = books.filter((b) => {
    if (b.status === 'read') return false
    const days = Math.floor(
      (now.getTime() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    return days >= threshold
  })

  if (warned.length === 0) return null

  return (
    <div className="mb-4 bg-yellow-950/80 border border-yellow-700/60 text-yellow-200 rounded-xl px-4 py-3 text-sm flex items-center gap-3">
      <TriangleAlert className="w-4 h-4 text-yellow-400 flex-shrink-0" />
      <span>
        <strong className="text-yellow-300">{warned.length}冊</strong>
        の本が{threshold}日以上読まれていません。そろそろ読みましょう！
      </span>
    </div>
  )
}
