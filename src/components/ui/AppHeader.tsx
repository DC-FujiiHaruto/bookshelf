import Link from 'next/link'
import { BookOpen, Plus, BarChart3, Rss, Settings } from 'lucide-react'
import LogoutButton from './LogoutButton'

export default function AppHeader() {
  return (
    <header className="bg-amber-900 shadow-md px-4 py-3 flex items-center justify-between">
      <Link href="/bookshelf" className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
        <span className="text-amber-100 text-xl font-bold">MyBookshelf</span>
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/bookshelf/add"
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
        >
          <Plus className="w-4 h-4" />
          本を追加
        </Link>
        <Link href="/stats" className="flex items-center gap-1 text-amber-300 hover:text-amber-100 text-sm transition-colors">
          <BarChart3 className="w-4 h-4" />
          統計
        </Link>
        <Link href="/feed" className="flex items-center gap-1 text-amber-300 hover:text-amber-100 text-sm transition-colors">
          <Rss className="w-4 h-4" />
          フィード
        </Link>
        <Link href="/settings/profile" className="flex items-center gap-1 text-amber-300 hover:text-amber-100 text-sm transition-colors">
          <Settings className="w-4 h-4" />
          設定
        </Link>
        <LogoutButton />
      </div>
    </header>
  )
}
