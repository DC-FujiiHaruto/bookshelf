import Image from 'next/image'
import type { Book } from '@/types/book'

type Props = { books: Book[] }

export default function TsundokuRanking({ books }: Props) {
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  const ranked = books
    .filter((b) => b.status !== 'read')
    .map((b) => ({
      ...b,
      days: Math.floor((now - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => b.days - a.days)
    .slice(0, 5)

  if (ranked.length === 0) {
    return <p className="text-amber-500 text-sm text-center py-4">積読・読中の本がありません</p>
  }

  return (
    <ol className="space-y-3">
      {ranked.map((book, i) => (
        <li key={book.id} className="flex items-center gap-3">
          <span className="text-amber-400 font-bold text-sm w-4">{i + 1}</span>
          <div className="w-8 h-11 relative flex-shrink-0 rounded overflow-hidden bg-amber-800">
            {book.cover_image_url ? (
              <Image src={book.cover_image_url} alt={book.title} fill className="object-cover" sizes="32px" />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-100 text-sm font-semibold truncate">{book.title}</p>
            <p className="text-amber-400 text-xs truncate">{book.author}</p>
          </div>
          <span className={`text-sm font-bold flex-shrink-0 ${book.days >= 90 ? 'text-red-400' : book.days >= 30 ? 'text-yellow-400' : 'text-amber-400'}`}>
            {book.days}日
          </span>
        </li>
      ))}
    </ol>
  )
}
