import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Users } from 'lucide-react'
import AppHeader from '@/components/ui/AppHeader'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // フォロー中ユーザーのIDを取得
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = (follows ?? []).map((f) => f.following_id)

  // フォロー中ユーザーの最近の読了本を取得
  const { data: books } = followingIds.length > 0
    ? await supabase
        .from('books')
        .select('*, user_profiles!inner(username, display_name, avatar_url)')
        .in('user_id', followingIds)
        .eq('status', 'read')
        .order('read_date', { ascending: false })
        .limit(30)
    : { data: [] }

  return (
    <div className="min-h-screen bg-amber-950">
      <AppHeader />

      <div className="px-4 py-6 max-w-lg mx-auto">
        {followingIds.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-amber-900/40 rounded-2xl p-6 mb-5 inline-block ring-1 ring-amber-800/40">
              <Users className="w-12 h-12 text-amber-600" strokeWidth={1.2} />
            </div>
            <p className="text-amber-300 font-semibold mb-2">まだ誰もフォローしていません</p>
            <p className="text-amber-500 text-sm">他のユーザーをフォローすると読了本がここに表示されます</p>
          </div>
        ) : (books ?? []).length === 0 ? (
          <p className="text-amber-500 text-sm text-center py-16">フォロー中のユーザーがまだ本を読了していません</p>
        ) : (
          <ul className="space-y-4">
            {(books ?? []).map((book: Record<string, unknown>) => {
              const profile = book.user_profiles as { username: string; display_name: string; avatar_url: string | null }
              return (
                <li key={book.id as string} className="bg-amber-900/50 rounded-xl p-4 flex gap-3">
                  <div className="w-12 h-16 relative flex-shrink-0 rounded overflow-hidden bg-amber-800">
                    {book.cover_image_url ? (
                      <Image src={book.cover_image_url as string} alt={book.title as string} fill className="object-cover" sizes="48px" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-amber-100 font-semibold text-sm truncate">{book.title as string}</p>
                    <p className="text-amber-400 text-xs">{book.author as string}</p>
                    {(book.rating as number) > 0 && (
                      <p className="text-yellow-400 text-xs mt-1">{'★'.repeat(book.rating as number)}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {profile.avatar_url && (
                        <Image src={profile.avatar_url} alt={profile.display_name} width={16} height={16} className="rounded-full" />
                      )}
                      <Link href={`/users/${profile.username}`} className="text-amber-400 hover:text-amber-200 text-xs">
                        @{profile.username}
                      </Link>
                      <span className="text-amber-600 text-xs">{book.read_date as string}</span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
