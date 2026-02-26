import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppHeader from '@/components/ui/AppHeader'
import ProfileSettingsForm from '@/components/ui/ProfileSettingsForm'

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/bookshelf')

  return (
    <div className="min-h-screen bg-amber-950">
      <AppHeader />
      <div className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h1 className="text-amber-100 text-2xl font-bold mb-6">プロフィール設定</h1>
          <ProfileSettingsForm profile={profile} />
        </div>
      </div>
    </div>
  )
}
