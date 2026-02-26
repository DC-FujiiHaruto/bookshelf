import { NextResponse } from 'next/server'

type GoogleBooksItem = {
  id: string
  volumeInfo: {
    title?: string
    authors?: string[]
    imageLinks?: { thumbnail?: string; smallThumbnail?: string }
    infoLink?: string
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const author = searchParams.get('author') ?? ''
  const excludeIds = new Set(searchParams.get('exclude')?.split(',').filter(Boolean) ?? [])

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY

  // 著者名で inauthor: 検索 → 同じ著者の別作品を提案
  const q = author ? `inauthor:${author}` : '小説'

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20&langRestrict=ja&orderBy=relevance&key=${apiKey}`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) {
    return NextResponse.json({ error: 'Google Books API error' }, { status: 502 })
  }

  const json = await res.json()
  const items: GoogleBooksItem[] = json.items ?? []

  const results = items
    .filter((item) => !excludeIds.has(item.id) && item.volumeInfo.title)
    .map((item) => ({
      google_books_id: item.id,
      title: item.volumeInfo.title ?? '',
      author: item.volumeInfo.authors?.join(', ') ?? '著者不明',
      cover_image_url:
        (item.volumeInfo.imageLinks?.thumbnail ?? item.volumeInfo.imageLinks?.smallThumbnail ?? null)
          ?.replace('http:', 'https:') ?? null,
      info_url: item.volumeInfo.infoLink ?? `https://books.google.com/books?id=${item.id}`,
    }))
    .slice(0, 10)

  return NextResponse.json(results)
}
