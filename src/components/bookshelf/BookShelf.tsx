'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { createClient } from '@/lib/supabase/client'
import BookSpine from './BookSpine'
import BookDetailWrapper from './BookDetailWrapper'
import BookSearch from './BookSearch'
import EmptyState from './EmptyState'
import type { Book } from '@/types/book'

type Props = {
  books: Book[]
  threshold: number
}

const BOOKS_PER_ROW = 10

export default function BookShelf({ books: initialBooks, threshold }: Props) {
  const [mounted, setMounted] = useState(false)
  const [books, setBooks] = useState(initialBooks)
  const [selected, setSelected] = useState<Book | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])

  // ジャンル一覧
  const genres = useMemo(() => {
    const set = new Set(books.map((b) => b.genre).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [books])

  // 検索・フィルター適用後の本リスト（dnd用の全リストとは別管理）
  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return books.filter((b) => {
      if (selectedGenre && b.genre !== selectedGenre) return false
      if (q && !b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false
      return true
    })
  }, [books, searchQuery, selectedGenre])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = books.findIndex((b) => b.id === active.id)
      const newIndex = books.findIndex((b) => b.id === over.id)
      const newBooks = arrayMove(books, oldIndex, newIndex)
      setBooks(newBooks)

      const supabase = createClient()
      await Promise.all(
        newBooks.map((book, index) =>
          supabase.from('books').update({ sort_order: index }).eq('id', book.id)
        )
      )
    },
    [books]
  )

  if (books.length === 0) {
    return <EmptyState />
  }

  // フィルター後の本を棚ごとに分割
  const shelves: Book[][] = []
  for (let i = 0; i < filteredBooks.length; i += BOOKS_PER_ROW) {
    shelves.push(filteredBooks.slice(i, i + BOOKS_PER_ROW))
  }

  const shelvesContent = filteredBooks.length === 0 ? (
    <p className="text-amber-500 text-sm text-center py-16">該当する本が見つかりません</p>
  ) : (
    <div className="space-y-6">
      {shelves.map((shelf, shelfIdx) => (
        <div key={shelfIdx} className="relative">
          <div className="flex items-end gap-1 px-4 pb-0 min-h-36">
            {shelf.map((book) => (
              <BookSpine
                key={book.id}
                book={book}
                threshold={threshold}
                onClick={() => setSelected(book)}
              />
            ))}
          </div>
          <div className="h-4 bg-gradient-to-b from-amber-700 to-amber-800 rounded-sm shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-amber-900/50 rounded-l-sm" />
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-amber-900/50 rounded-r-sm" />
        </div>
      ))}
    </div>
  )

  return (
    <>
      {/* 検索・ジャンルフィルター */}
      <BookSearch
        query={searchQuery}
        onQueryChange={setSearchQuery}
        genres={genres}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
      />

      {mounted ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={books.map((b) => b.id)} strategy={rectSortingStrategy}>
            {shelvesContent}
          </SortableContext>
        </DndContext>
      ) : (
        shelvesContent
      )}

      {/* 本の詳細ポップアップ */}
      {selected && (
        <BookDetailWrapper
          book={selected}
          onClose={() => setSelected(null)}
          onDelete={(id) => {
            setBooks((prev) => prev.filter((b) => b.id !== id))
            setSelected(null)
          }}
        />
      )}
    </>
  )
}
