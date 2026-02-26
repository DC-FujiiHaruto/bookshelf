import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, ChevronLeft } from 'lucide-react'
import FollowButton from '@/components/social/FollowButton'
import type { Book } from '@/types/book'

type Props = { params: Promise<{ username: string }> }

const STATUS_LABEL: Record<string, string> = {
  want_to_read: '積読', reading: '読中', read: '読了',
}

export default async function PublicProfilePage({ params }: Props) {
  const supabase = await createClient()
  const { username } = await params

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile || !profile.is_public) notFound()

  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', profile.id)
    .eq('status', 'read')
    .order('read_date', { ascending: false })

  const readBooks: Book[] = books ?? []
  const thisYear = new Date().getFullYear()
  const thisYearCount = readBooks.filter((b) => b.read_date?.startsWith(String(thisYear))).length

  // フォロー状態
  let isFollowing = false
  if (currentUser && currentUser.id !== profile.id) {
    const { data: follow } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)
      .single()
    isFollowing = !!follow
  }

  return (
    <div className="min-h-screen bg-amber-950">
      <header className="bg-amber-900 shadow-md px-4 py-3 flex items-center gap-3">
        <Link href="/bookshelf" className="flex items-center gap-1 text-amber-400 hover:text-amber-200 text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" />
          本棚
        </Link>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
          <h1 className="text-amber-100 text-xl font-bold">MyBookshelf</h1>
        </div>
      </header>

      <div className="px-4 py-6 max-w-3xl mx-auto">
        {/* プロフィールヘッダー */}
        <div className="bg-amber-900/50 rounded-xl p-5 mb-6 flex items-start gap-4">
          {profile.avatar_url && (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name}
              width={56}
              height={56}
              className="rounded-full flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-amber-100 font-bold text-xl">{profile.display_name}</h2>
            <p className="text-amber-500 text-sm">@{profile.username}</p>
            {profile.bio && <p className="text-amber-300 text-sm mt-2">{profile.bio}</p>}
            <div className="flex gap-4 mt-3 text-sm">
              <span className="text-amber-400">読了 <strong className="text-amber-200">{readBooks.length}</strong>冊</span>
              <span className="text-amber-400">{thisYear}年 <strong className="text-amber-200">{thisYearCount}</strong>冊</span>
            </div>
          </div>
          {currentUser && currentUser.id !== profile.id && (
            <FollowButton
              followerId={currentUser.id}
              followingId={profile.id}
              initialIsFollowing={isFollowing}
            />
          )}
        </div>

        {/* 読了本一覧 */}
        <h3 className="text-amber-200 font-semibold mb-3">読了した本</h3>
        {readBooks.length === 0 ? (
          <p className="text-amber-500 text-sm">まだ読了した本がありません</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {readBooks.map((book) => (
              <div key={book.id} className="group relative">
                <div className="aspect-[2/3] relative rounded overflow-hidden bg-amber-900">
                  {book.cover_image_url ? (
                    <Image src={book.cover_image_url} alt={book.title} fill className="object-cover" sizes="120px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-1 text-amber-400 text-xs text-center">
                      {book.title}
                    </div>
                  )}
                </div>
                <p className="text-amber-300 text-xs mt-1 truncate">{book.title}</p>
                {book.rating && (
                  <p className="text-yellow-400 text-xs">{'★'.repeat(book.rating)}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
