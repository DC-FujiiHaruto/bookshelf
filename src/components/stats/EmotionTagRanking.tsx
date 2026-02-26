import type { Book } from '@/types/book'

type Props = { books: Book[] }

export default function EmotionTagRanking({ books }: Props) {
  const counts: Record<string, number> = {}
  for (const b of books) {
    for (const tag of b.emotion_tags) {
      counts[tag] = (counts[tag] ?? 0) + 1
    }
  }

  const ranking = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  if (ranking.length === 0) {
    return <p className="text-amber-500 text-sm text-center py-4">感情タグがまだありません</p>
  }

  const max = ranking[0][1]

  return (
    <ul className="space-y-2">
      {ranking.map(([tag, count], i) => (
        <li key={tag} className="flex items-center gap-3">
          <span className="text-amber-400 text-sm w-4 font-bold">{i + 1}</span>
          <span className="text-amber-100 text-sm w-24 flex-shrink-0">{tag}</span>
          <div className="flex-1 bg-amber-950 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="text-amber-400 text-sm w-10 text-right">{count}冊</span>
        </li>
      ))}
    </ul>
  )
}
