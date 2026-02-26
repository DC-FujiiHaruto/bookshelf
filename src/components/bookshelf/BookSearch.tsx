'use client'

import { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { localizeGenre } from '@/types/book'

type Props = {
  query: string
  onQueryChange: (v: string) => void
  genres: string[]
  selectedGenre: string | null
  onGenreChange: (v: string | null) => void
}

export default function BookSearch({
  query,
  onQueryChange,
  genres,
  selectedGenre,
  onGenreChange,
}: Props) {
  const [open, setOpen] = useState(false)

  const hasFilter = query.length > 0 || selectedGenre !== null

  return (
    <div className="mb-5">
      {/* トグルボタン */}
      <div className="flex items-center justify-end mb-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors ${
            hasFilter
              ? 'bg-amber-500 text-white'
              : open
              ? 'bg-amber-800 text-amber-200'
              : 'bg-amber-900/50 text-amber-400 hover:bg-amber-800/60'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {hasFilter ? `絞り込み中` : '検索・絞り込み'}
          {hasFilter && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onQueryChange('')
                onGenreChange(null)
              }}
              className="ml-0.5 hover:text-white/80"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </button>
      </div>

      {/* 展開パネル */}
      {open && (
        <div className="bg-amber-900/40 border border-amber-800/50 rounded-xl p-3 space-y-3">
          {/* テキスト検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="タイトル・著者で検索..."
              className="w-full bg-amber-950 border border-amber-800/60 text-amber-100 placeholder-amber-600 rounded-full pl-9 pr-9 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              autoFocus
            />
            {query && (
              <button
                onClick={() => onQueryChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ジャンルフィルター */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onGenreChange(null)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  selectedGenre === null
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-900/50 text-amber-400 hover:bg-amber-800/60'
                }`}
              >
                すべて
              </button>
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => onGenreChange(selectedGenre === genre ? null : genre)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    selectedGenre === genre
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-900/50 text-amber-400 hover:bg-amber-800/60'
                  }`}
                >
                  {localizeGenre(genre)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
