import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BookShelf from '@/components/bookshelf/BookShelf'
import TsundokuBanner from '@/components/bookshelf/TsundokuBanner'
import ReadingFAB from '@/components/bookshelf/ReadingFAB'
import BookRecommendations from '@/components/bookshelf/BookRecommendations'
import AppHeader from '@/components/ui/AppHeader'
import type { BookStatus } from '@/types/book'

type Props = {
  searchParams: Promise<{ status?: string }>
}

export default async function BookshelfPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const params = await searchParams
  const activeStatus = (params.status ?? 'all') as BookStatus | 'all'

  // 本を取得（sort_order優先、なければ登録日降順）
  let query = supabase
    .from('books')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (activeStatus !== 'all') {
    query = query.eq('status', activeStatus)
  }

  const { data: books } = await query

  // プロフィール（積読閾値）取得
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tsundoku_threshold_days')
    .eq('id', user.id)
    .single()

  const threshold = profile?.tsundoku_threshold_days ?? 30

  // FAB用：積読・読中の本を取得
  const { data: readableBooks } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['want_to_read', 'reading'])
    .order('created_at', { ascending: false })

  const STATUS_TABS = [
    { key: 'all', label: 'すべて' },
    { key: 'want_to_read', label: '積読' },
    { key: 'reading', label: '読中' },
    { key: 'read', label: '読了' },
  ] as const

  return (
    <div className="min-h-screen bg-amber-950">
      <AppHeader />

      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* 積読警告バナー */}
        <TsundokuBanner books={books ?? []} threshold={threshold} />

        {/* ステータスタブ */}
        <div className="flex gap-2 mb-6">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.key === 'all' ? '/bookshelf' : `/bookshelf?status=${tab.key}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeStatus === tab.key
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-900 text-amber-300 hover:bg-amber-800'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* 本棚 */}
        <BookShelf key={activeStatus} books={books ?? []} threshold={threshold} />

        {/* おすすめの本 */}
        <BookRecommendations readBooks={(books ?? []).filter((b) => b.status === 'read')} />
      </div>

      {/* 読書FAB + フローティングタイマー */}
      <ReadingFAB books={readableBooks ?? []} userId={user.id} />
    </div>
  )
}
