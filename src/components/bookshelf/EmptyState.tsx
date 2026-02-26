import Link from 'next/link'
import { BookOpen, Plus } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-amber-300">
      <div className="bg-amber-900/40 rounded-2xl p-6 mb-5 ring-1 ring-amber-800/40">
        <BookOpen className="w-14 h-14 text-amber-600" strokeWidth={1.2} />
      </div>
      <p className="text-xl font-semibold mb-2 text-amber-200">本棚が空です</p>
      <p className="text-sm mb-6 text-amber-500">最初の1冊を登録しましょう</p>
      <Link
        href="/bookshelf/add"
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-2.5 rounded-full transition-colors shadow-md"
      >
        <Plus className="w-4 h-4" />
        本を追加
      </Link>
    </div>
  )
}
