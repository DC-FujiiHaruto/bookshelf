import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EditBookForm from '@/components/bookshelf/EditBookForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditBookPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { id } = await params
  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!book) notFound()

  return (
    <div className="min-h-screen bg-amber-950 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-amber-100 text-2xl font-bold mb-6">✏️ 本を編集</h1>
        <EditBookForm book={book} />
      </div>
    </div>
  )
}
