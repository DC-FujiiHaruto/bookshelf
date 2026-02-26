'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { EMOTION_TAGS, type BookStatus } from '@/types/book'

type SearchResult = {
  google_books_id: string
  title: string
  author: string
  cover_image_url: string | null
  genre: string | null
  total_pages: number | null
}

type Props = { userId: string }

export default function AddBookForm({ userId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [status, setStatus] = useState<BookStatus>('want_to_read')
  const [readDate, setReadDate] = useState('')
  const [rating, setRating] = useState(0)
  const [impression, setImpression] = useState('')
  const [emotionTags, setEmotionTags] = useState<string[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setQuery(q)
    setSelected(null)
    setSearching(true)
    setSearchError('')
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error()
      setResults(await res.json())
    } catch {
      setSearchError('検索に失敗しました。もう一度お試しください。')
    } finally {
      setSearching(false)
    }
  }, [])

  // URLの ?q= パラメータで初期検索
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) doSearch(q)
  }, [searchParams, doSearch])

  const handleSearch = () => doSearch(query)

  const toggleEmotionTag = (tag: string) => {
    setEmotionTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (!selected) return
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('books').insert({
      user_id: userId,
      title: selected.title,
      author: selected.author,
      cover_image_url: selected.cover_image_url,
      google_books_id: selected.google_books_id,
      genre: selected.genre,
      total_pages: selected.total_pages,
      status,
      read_date: status === 'read' ? readDate || null : null,
      rating: status === 'read' && rating > 0 ? rating : null,
      impression: impression || null,
      emotion_tags: emotionTags,
    })
    setSubmitting(false)
    if (error) {
      alert('登録に失敗しました')
      return
    }
    router.push('/bookshelf')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* 検索入力 */}
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-amber-900/50 rounded-xl p-4">
          <label className="text-amber-300 text-sm font-semibold block mb-2">本を検索</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="タイトルまたは著者名"
              className="flex-1 bg-amber-950 text-amber-100 border border-amber-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {searching ? '…' : '検索'}
            </button>
          </div>
          {searchError && <p className="text-red-400 text-xs mt-2">{searchError}</p>}
        </div>
      </div>

      {/* 検索結果（フル幅） */}
      {results.length > 0 && !selected && (
        <div className="px-4">
          <p className="text-amber-600 text-xs mb-2 max-w-lg mx-auto">{results.length}件見つかりました</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
            {results.map((r) => (
              <div
                key={r.google_books_id}
                className="flex flex-col items-center gap-1.5 bg-amber-900/50 hover:bg-amber-800/60 rounded-lg p-2 transition-colors text-center"
              >
                <button
                  onClick={() => setSelected(r)}
                  className="w-full flex flex-col items-center gap-1.5"
                >
                  {r.cover_image_url ? (
                    <Image src={r.cover_image_url} alt={r.title} width={64} height={88} className="object-cover rounded w-full aspect-[2/3]" />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-amber-800 rounded" />
                  )}
                  <p className="text-amber-100 text-xs font-semibold line-clamp-2 leading-tight">{r.title}</p>
                </button>
                <button
                  onClick={() => doSearch(r.author)}
                  className="text-amber-500 hover:text-amber-300 text-[10px] truncate w-full text-center transition-colors"
                >
                  {r.author}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 選択した本 */}
      {selected && (
        <div className="max-w-lg mx-auto px-4">
        <div className="bg-amber-900/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            {selected.cover_image_url ? (
              <Image src={selected.cover_image_url} alt={selected.title} width={48} height={64} className="object-cover rounded flex-shrink-0" />
            ) : (
              <div className="w-12 h-16 bg-amber-800 rounded flex-shrink-0" />
            )}
            <div>
              <p className="text-amber-100 font-bold">{selected.title}</p>
              <button
                onClick={() => doSearch(selected.author)}
                className="text-amber-400 hover:text-amber-200 text-sm transition-colors text-left"
              >
                {selected.author}
              </button>
            </div>
            <button onClick={() => setSelected(null)} className="ml-auto text-amber-500 hover:text-amber-300 text-sm">変更</button>
          </div>

          {/* 読書状態 */}
          <div className="mb-4">
            <label className="text-amber-300 text-sm font-semibold block mb-2">読書状態</label>
            <div className="flex gap-2">
              {([
                { value: 'want_to_read', label: '積読' },
                { value: 'reading', label: '読中' },
                { value: 'read', label: '読了' },
              ] as const).map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    status === s.value
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-950 text-amber-400 hover:bg-amber-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 読了日・評価（読了時のみ） */}
          {status === 'read' && (
            <>
              <div className="mb-4">
                <label className="text-amber-300 text-sm font-semibold block mb-2">読了日</label>
                <input
                  type="date"
                  value={readDate}
                  onChange={(e) => setReadDate(e.target.value)}
                  className="bg-amber-950 text-amber-100 border border-amber-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="mb-4">
                <label className="text-amber-300 text-sm font-semibold block mb-2">評価</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRating(rating === n ? 0 : n)}
                      className={`text-2xl transition-colors ${n <= rating ? 'text-yellow-400' : 'text-amber-800'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 感情タグ */}
          <div className="mb-4">
            <label className="text-amber-300 text-sm font-semibold block mb-2">感情タグ</label>
            <div className="flex flex-wrap gap-2">
              {EMOTION_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleEmotionTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    emotionTags.includes(tag)
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-950 text-amber-400 hover:bg-amber-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 感想 */}
          <div className="mb-6">
            <label className="text-amber-300 text-sm font-semibold block mb-2">感想・メモ</label>
            <textarea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="感想を書こう..."
              rows={4}
              className="w-full bg-amber-950 text-amber-100 border border-amber-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-50"
            >
              {submitting ? '登録中...' : '本棚に追加'}
            </button>
            <button
              onClick={() => setSelected(null)}
              className="flex-1 bg-amber-900 hover:bg-amber-800 text-amber-300 font-semibold py-3 rounded-full transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  )
}
