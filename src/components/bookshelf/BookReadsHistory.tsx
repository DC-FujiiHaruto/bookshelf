'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, BookOpen, X } from 'lucide-react'
import { EMOTION_TAGS } from '@/types/book'
import type { BookRead } from '@/types/book_read'

type Props = {
  bookId: string
  userId: string
  initialReads: BookRead[]
}

export default function BookReadsHistory({ bookId, userId, initialReads }: Props) {
  const [reads, setReads] = useState(initialReads)
  const [adding, setAdding] = useState(false)
  const [readDate, setReadDate] = useState('')
  const [rating, setRating] = useState(0)
  const [impression, setImpression] = useState('')
  const [emotionTags, setEmotionTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const nextReadNumber = reads.length + 1

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('book_reads')
      .insert({
        book_id: bookId,
        user_id: userId,
        read_number: nextReadNumber,
        read_date: readDate || null,
        rating: rating || null,
        impression: impression || null,
        emotion_tags: emotionTags,
      })
      .select('*')
      .single()

    if (data) {
      setReads([...reads, data as BookRead])
      setAdding(false)
      setReadDate('')
      setRating(0)
      setImpression('')
      setEmotionTags([])
    }
    setSaving(false)
  }

  const handleDelete = async (readId: string) => {
    if (!confirm('この読んだ記録を削除しますか？')) return
    const supabase = createClient()
    await supabase.from('book_reads').delete().eq('id', readId)
    setReads(reads.filter((r) => r.id !== readId))
  }

  const toggleTag = (tag: string) =>
    setEmotionTags((tags) =>
      tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]
    )

  return (
    <div className="border-t border-amber-800/50 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-amber-300 text-sm font-semibold flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" strokeWidth={1.5} />
          読んだ記録
        </h3>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-amber-500 hover:text-amber-300 text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            追加
          </button>
        )}
      </div>

      {/* 既存の記録 */}
      {reads.length > 0 && (
        <ul className="space-y-2 mb-3">
          {reads.map((read) => (
            <li key={read.id} className="bg-amber-900/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-amber-400 text-xs font-semibold">{read.read_number}回目</span>
                <div className="flex items-center gap-2">
                  {read.read_date && (
                    <span className="text-amber-600 text-xs">{read.read_date}</span>
                  )}
                  <button
                    onClick={() => handleDelete(read.id)}
                    className="text-amber-700 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {read.rating && (
                <p className="text-yellow-400 text-xs mb-1">
                  {'★'.repeat(read.rating)}{'☆'.repeat(5 - read.rating)}
                </p>
              )}
              {read.emotion_tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {read.emotion_tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-amber-900 text-amber-500 text-[10px] px-1.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {read.impression && (
                <p className="text-amber-300 text-xs line-clamp-2">{read.impression}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {reads.length === 0 && !adding && (
        <p className="text-amber-600 text-xs text-center py-2">まだ記録がありません</p>
      )}

      {/* 新しい記録フォーム */}
      {adding && (
        <div className="bg-amber-900/30 rounded-lg p-3 space-y-3">
          <p className="text-amber-400 text-xs font-semibold">{nextReadNumber}回目の記録を追加</p>

          <div>
            <label className="text-amber-500 text-xs block mb-1">読了日</label>
            <input
              type="date"
              value={readDate}
              onChange={(e) => setReadDate(e.target.value)}
              className="w-full bg-amber-950 text-amber-100 border border-amber-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-amber-500 text-xs block mb-1">評価</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(rating === n ? 0 : n)}
                  className={`text-xl transition-colors ${n <= rating ? 'text-yellow-400' : 'text-amber-800 hover:text-amber-600'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-amber-500 text-xs block mb-1">感情タグ</label>
            <div className="flex flex-wrap gap-1">
              {EMOTION_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    emotionTags.includes(tag)
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-900/60 text-amber-400 hover:bg-amber-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-amber-500 text-xs block mb-1">感想</label>
            <textarea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              rows={3}
              className="w-full bg-amber-950 text-amber-100 border border-amber-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-400 resize-none"
              placeholder="この回の感想..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold py-2 rounded-full transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={() => setAdding(false)}
              className="flex-1 bg-amber-900 hover:bg-amber-800 text-amber-400 text-xs font-semibold py-2 rounded-full transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
