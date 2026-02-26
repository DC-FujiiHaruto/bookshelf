'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { EMOTION_TAGS, type Book, type BookStatus } from '@/types/book'

type Props = { book: Book }

export default function EditBookForm({ book }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<BookStatus>(book.status)
  const [readDate, setReadDate] = useState(book.read_date ?? '')
  const [rating, setRating] = useState(book.rating ?? 0)
  const [impression, setImpression] = useState(book.impression ?? '')
  const [emotionTags, setEmotionTags] = useState<string[]>(book.emotion_tags)
  const [submitting, setSubmitting] = useState(false)

  const toggleEmotionTag = (tag: string) => {
    setEmotionTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('books')
      .update({
        status,
        read_date: status === 'read' ? readDate || null : null,
        rating: status === 'read' && rating > 0 ? rating : null,
        impression: impression || null,
        emotion_tags: emotionTags,
      })
      .eq('id', book.id)

    setSubmitting(false)
    if (error) {
      alert('更新に失敗しました')
      return
    }
    router.push('/bookshelf')
    router.refresh()
  }

  return (
    <div className="bg-amber-900/50 rounded-xl p-4 space-y-4">
      {/* 本の情報（変更不可） */}
      <div className="flex items-center gap-3 pb-4 border-b border-amber-800">
        {book.cover_image_url ? (
          <Image src={book.cover_image_url} alt={book.title} width={48} height={64} className="object-cover rounded flex-shrink-0" />
        ) : (
          <div className="w-12 h-16 bg-amber-800 rounded flex-shrink-0" />
        )}
        <div>
          <p className="text-amber-100 font-bold">{book.title}</p>
          <p className="text-amber-400 text-sm">{book.author}</p>
        </div>
      </div>

      {/* 読書状態 */}
      <div>
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
          <div>
            <label className="text-amber-300 text-sm font-semibold block mb-2">読了日</label>
            <input
              type="date"
              value={readDate}
              onChange={(e) => setReadDate(e.target.value)}
              className="bg-amber-950 text-amber-100 border border-amber-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
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
      <div>
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
      <div>
        <label className="text-amber-300 text-sm font-semibold block mb-2">感想・メモ</label>
        <textarea
          value={impression}
          onChange={(e) => setImpression(e.target.value)}
          rows={4}
          className="w-full bg-amber-950 text-amber-100 border border-amber-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-50"
        >
          {submitting ? '更新中...' : '保存'}
        </button>
        <button
          onClick={() => router.back()}
          className="flex-1 bg-amber-900 hover:bg-amber-800 text-amber-300 font-semibold py-3 rounded-full transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
