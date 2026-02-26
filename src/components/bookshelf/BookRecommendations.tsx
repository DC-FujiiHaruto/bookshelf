'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Sparkles, RefreshCw, ExternalLink } from 'lucide-react'
import type { Book } from '@/types/book'

type RecommendedBook = {
  google_books_id: string
  title: string
  author: string
  cover_image_url: string | null
  info_url: string
}

type Props = {
  readBooks: Book[]
}

function getTopItems(books: Book[], key: 'author' | 'genre', limit: number): string[] {
  const counts = new Map<string, number>()
  for (const book of books) {
    const val = book[key]
    if (val) counts.set(val, (counts.get(val) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([val]) => val)
}

export default function BookRecommendations({ readBooks }: Props) {
  const [books, setBooks] = useState<RecommendedBook[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRecommendations = useCallback(async () => {
    setLoading(true)

    // 読書頻度が高い著者（上位3人）・ジャンル（上位2つ）を集計
    const topAuthors = getTopItems(readBooks, 'author', 3)
    const topGenres = getTopItems(readBooks, 'genre', 2)

    const excludeIds = readBooks
      .map((b) => b.google_books_id)
      .filter(Boolean)
      .join(',')

    const params = new URLSearchParams()
    for (const a of topAuthors) params.append('authors', a)
    for (const g of topGenres) params.append('genres', g)
    if (excludeIds) params.set('exclude', excludeIds)

    try {
      const res = await fetch(`/api/books/recommend?${params}`)
      if (!res.ok) {
        setBooks([])
        return
      }
      const data = await res.json()
      setBooks(Array.isArray(data) ? data : [])
    } catch {
      // エラー時は空のまま
    } finally {
      setLoading(false)
    }
  }, [readBooks])

  useEffect(() => {
    if (readBooks.length > 0) fetchRecommendations()
  }, [fetchRecommendations])

  if (readBooks.length === 0) return null

  return (
    <div className="mt-8 border-t border-amber-800/40 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-amber-200 font-semibold flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
          おすすめの本
        </h2>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="flex items-center gap-1 text-amber-500 hover:text-amber-300 text-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          更新
        </button>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-20 animate-pulse">
              <div className="w-20 aspect-[2/3] bg-amber-900/60 rounded-lg mb-1.5" />
              <div className="h-2 bg-amber-900/60 rounded w-full mb-1" />
              <div className="h-2 bg-amber-900/60 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : books.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {books.map((book) => (
            <a
              key={book.google_books_id}
              href={book.info_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-20 group"
            >
              <div className="relative w-20 aspect-[2/3] rounded-lg overflow-hidden bg-amber-900 mb-1.5 group-hover:ring-2 group-hover:ring-amber-400 transition-all">
                {book.cover_image_url ? (
                  <Image
                    src={book.cover_image_url}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-1 text-amber-600 text-[9px] text-center leading-tight">
                    {book.title}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-end p-1 opacity-0 group-hover:opacity-100">
                  <ExternalLink className="w-3 h-3 text-white" />
                </div>
              </div>
              <p className="text-amber-200 text-[10px] font-semibold line-clamp-2 leading-tight">{book.title}</p>
              <p className="text-amber-500 text-[9px] truncate">{book.author}</p>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
