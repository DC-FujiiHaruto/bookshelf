'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/types/profile'

type Props = { profile: UserProfile }

export default function ProfileSettingsForm({ profile }: Props) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [isPublic, setIsPublic] = useState(profile.is_public)
  const [threshold, setThreshold] = useState(profile.tsundoku_threshold_days)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('user_profiles')
      .update({
        display_name: displayName,
        bio: bio || null,
        is_public: isPublic,
        tsundoku_threshold_days: threshold,
      })
      .eq('id', profile.id)

    setSubmitting(false)
    if (error) {
      alert('保存に失敗しました')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="bg-amber-900/50 rounded-xl p-4 space-y-4">
      <div>
        <label className="text-amber-300 text-sm font-semibold block mb-2">表示名</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full bg-amber-950 text-amber-100 border border-amber-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
        />
      </div>

      <div>
        <label className="text-amber-300 text-sm font-semibold block mb-1">ユーザー名</label>
        <p className="text-amber-500 text-sm">@{profile.username}</p>
      </div>

      <div>
        <label className="text-amber-300 text-sm font-semibold block mb-2">自己紹介</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full bg-amber-950 text-amber-100 border border-amber-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none"
        />
      </div>

      <div>
        <label className="text-amber-300 text-sm font-semibold block mb-2">本棚の公開設定</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPublic(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${isPublic ? 'bg-amber-500 text-white' : 'bg-amber-950 text-amber-400 hover:bg-amber-800'}`}
          >
            公開
          </button>
          <button
            onClick={() => setIsPublic(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${!isPublic ? 'bg-amber-500 text-white' : 'bg-amber-950 text-amber-400 hover:bg-amber-800'}`}
          >
            非公開
          </button>
        </div>
      </div>

      <div>
        <label className="text-amber-300 text-sm font-semibold block mb-2">
          積読警告の閾値
        </label>
        <div className="flex gap-2">
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => setThreshold(days)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                threshold === days ? 'bg-amber-500 text-white' : 'bg-amber-950 text-amber-400 hover:bg-amber-800'
              }`}
            >
              {days}日
            </button>
          ))}
        </div>
        <p className="text-amber-600 text-xs mt-1">この日数以上積んでいる本に警告を表示します</p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`w-full font-semibold py-3 rounded-full transition-colors ${
          saved
            ? 'bg-green-700 text-green-200'
            : 'bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-50'
        }`}
      >
        {saved ? '✓ 保存しました' : submitting ? '保存中...' : '保存'}
      </button>
    </div>
  )
}
