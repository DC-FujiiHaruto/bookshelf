import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookOpen, Timer, BarChart3, Users, BookMarked, Star } from 'lucide-react'
import LoginButton from '@/components/ui/LoginButton'

const FEATURES = [
  {
    icon: BookMarked,
    title: 'リアル本棚UI',
    desc: '木製本棚に背表紙が並ぶ没入感',
  },
  {
    icon: Timer,
    title: '読書タイマー',
    desc: '読書時間をセッションごとに記録',
  },
  {
    icon: BarChart3,
    title: '統計グラフ',
    desc: '月別・ジャンル別に読書傾向を可視化',
  },
  {
    icon: Users,
    title: 'ソーシャル機能',
    desc: 'フォローして他の読書家と繋がる',
  },
  {
    icon: Star,
    title: '感情タグ・評価',
    desc: '読後の感情を細かく記録',
  },
  {
    icon: BookOpen,
    title: '積読アラート',
    desc: '長期間未読の本をリマインド',
  },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/bookshelf')
  }

  return (
    <main className="min-h-screen bg-amber-950 flex flex-col items-center justify-center px-4 py-16">
      {/* ロゴ＆キャッチコピー */}
      <div className="text-center text-amber-100 mb-14">
        <div className="flex items-center justify-center mb-5">
          <div className="bg-amber-700/60 rounded-2xl p-4 shadow-lg ring-1 ring-amber-600/40">
            <BookOpen className="w-14 h-14 text-amber-300" strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-3 tracking-tight">MyBookshelf</h1>
        <p className="text-xl text-amber-300 mb-2">あなただけのリアル本棚</p>
        <p className="text-amber-500 text-sm">
          読んだ本を棚に並べて、読書の記録を残そう
        </p>
      </div>

      {/* 機能グリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12 max-w-2xl w-full">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-amber-900/40 border border-amber-800/50 rounded-xl p-4 hover:bg-amber-900/60 transition-colors"
          >
            <Icon className="w-6 h-6 text-amber-400 mb-2" strokeWidth={1.5} />
            <div className="font-semibold text-amber-100 text-sm mb-1">{title}</div>
            <div className="text-amber-500 text-xs leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>

      <LoginButton />
    </main>
  )
}
