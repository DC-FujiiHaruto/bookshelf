import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AddBookForm from '@/components/bookshelf/AddBookForm'
import AppHeader from '@/components/ui/AppHeader'

export default async function AddBookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  return (
    <div className="min-h-screen bg-amber-950">
      <AppHeader />
      <div className="py-8">
        <AddBookForm userId={user.id} />
      </div>
    </div>
  )
}
