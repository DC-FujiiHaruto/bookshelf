import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppHeader from '@/components/ui/AppHeader'
import MonthlyChart from '@/components/stats/MonthlyChart'
import GenreChart from '@/components/stats/GenreChart'
import EmotionTagRanking from '@/components/stats/EmotionTagRanking'
import TsundokuRanking from '@/components/stats/TsundokuRanking'
import ReadingHeatmap from '@/components/stats/ReadingHeatmap'
import type { Book } from '@/types/book'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user.id)

  const { data: sessions } = await supabase
    .from('reading_sessions')
    .select('duration_seconds')
    .eq('user_id', user.id)
    .not('duration_seconds', 'is', null)

  // ヒートマップ用：日付ごとの合計秒数
  const { data: heatmapRaw } = await supabase
    .from('reading_sessions')
    .select('started_at, duration_seconds')
    .eq('user_id', user.id)
    .not('duration_seconds', 'is', null)

  const heatmapMap = new Map<string, number>()
  for (const s of heatmapRaw ?? []) {
    const date = new Date(s.started_at).toISOString().split('T')[0]
    heatmapMap.set(date, (heatmapMap.get(date) ?? 0) + (s.duration_seconds ?? 0))
  }
  const heatmapSessions = Array.from(heatmapMap.entries()).map(([date, totalSeconds]) => ({ date, totalSeconds }))

  const allBooks: Book[] = books ?? []
  const readBooks = allBooks.filter((b) => b.status === 'read')
  const thisYear = new Date().getFullYear()
  const thisYearBooks = readBooks.filter((b) => b.read_date?.startsWith(String(thisYear)))
  const totalSeconds = (sessions ?? []).reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0)
  const totalHours = Math.floor(totalSeconds / 3600)
  const avgRating =
    readBooks.filter((b) => b.rating).length > 0
      ? (readBooks.reduce((sum, b) => sum + (b.rating ?? 0), 0) / readBooks.filter((b) => b.rating).length).toFixed(1)
      : null
  const totalPages = readBooks.reduce((sum, b) => sum + (b.total_pages ?? 0), 0)

  return (
    <div className="min-h-screen bg-amber-950">
      <AppHeader />

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* サマリーカード */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: '総読了冊数', value: `${readBooks.length}冊` },
            { label: `${thisYear}年`, value: `${thisYearBooks.length}冊` },
            { label: '総読書時間', value: `${totalHours}時間` },
            { label: '総読了ページ', value: totalPages > 0 ? `${totalPages.toLocaleString()}p` : '-' },
            { label: '平均評価', value: avgRating ? `★${avgRating}` : '-' },
          ].map((card) => (
            <div key={card.label} className="bg-amber-900/50 rounded-xl p-4 text-center">
              <div className="text-amber-400 text-xs mb-1">{card.label}</div>
              <div className="text-amber-100 text-2xl font-bold">{card.value}</div>
            </div>
          ))}
        </div>

        {/* 読書活動ヒートマップ */}
        <div className="bg-amber-900/50 rounded-xl p-4">
          <h2 className="text-amber-200 font-semibold mb-4">読書活動</h2>
          <ReadingHeatmap sessions={heatmapSessions} />
        </div>

        {/* 月別読了冊数 */}
        <div className="bg-amber-900/50 rounded-xl p-4">
          <h2 className="text-amber-200 font-semibold mb-4">月別読了冊数（{thisYear}年）</h2>
          <MonthlyChart books={readBooks} year={thisYear} />
        </div>

        {/* ジャンル別 */}
        <div className="bg-amber-900/50 rounded-xl p-4">
          <h2 className="text-amber-200 font-semibold mb-4">ジャンル別</h2>
          <GenreChart books={readBooks} />
        </div>

        {/* 感情タグランキング */}
        <div className="bg-amber-900/50 rounded-xl p-4">
          <h2 className="text-amber-200 font-semibold mb-4">感情タグランキング</h2>
          <EmotionTagRanking books={allBooks} />
        </div>

        {/* 積読ランキング */}
        <div className="bg-amber-900/50 rounded-xl p-4">
          <h2 className="text-amber-200 font-semibold mb-4">積読ランキング TOP5</h2>
          <TsundokuRanking books={allBooks} />
        </div>
      </div>
    </div>
  )
}
