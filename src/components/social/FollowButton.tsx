'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  followerId: string
  followingId: string
  initialIsFollowing: boolean
}

export default function FollowButton({ followerId, followingId, initialIsFollowing }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const supabase = createClient()

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
      setIsFollowing(false)
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId })
      setIsFollowing(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
        isFollowing
          ? 'bg-amber-900 text-amber-400 hover:bg-red-900 hover:text-red-300'
          : 'bg-amber-500 hover:bg-amber-400 text-white'
      }`}
    >
      {isFollowing ? 'フォロー中' : 'フォロー'}
    </button>
  )
}
