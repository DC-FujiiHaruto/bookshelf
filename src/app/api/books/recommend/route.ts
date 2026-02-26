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

async function fetchByQuery(q: string, apiKey: string): Promise<GoogleBooksItem[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20&langRestrict=ja&orderBy=relevance&key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  const json = await res.json()
  return json.items ?? []
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const authors = searchParams.get('authors')?.split(',').filter(Boolean) ?? []
  const genres = searchParams.get('genres')?.split(',').filter(Boolean) ?? []
  const excludeIds = new Set(searchParams.get('exclude')?.split(',').filter(Boolean) ?? [])

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY ?? ''

  // 著者リストからランダムに1人、ジャンルリストからランダムに1つ選ぶ
  const author = authors.length > 0
    ? authors[Math.floor(Math.random() * Math.min(authors.length, 3))]
    : null
  const genre = genres.length > 0
    ? genres[Math.floor(Math.random() * Math.min(genres.length, 2))]
    : null

  // 著者検索・ジャンル検索を並行実行
  const queries: string[] = []
  if (author) queries.push(`inauthor:${author}`)
  if (genre) queries.push(`subject:${genre}`)
  if (queries.length === 0) queries.push('小説 日本')

  const results = await Promise.all(queries.map((q) => fetchByQuery(q, apiKey)))
  const allItems = results.flat()

  // 重複排除・除外済み本のフィルタリング
  const seen = new Set<string>()
  const filtered = allItems
    .filter((item) => {
      if (!item.volumeInfo?.title) return false
      if (excludeIds.has(item.id)) return false
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
    .map((item) => ({
      google_books_id: item.id,
      title: item.volumeInfo.title ?? '',
      author: item.volumeInfo.authors?.join(', ') ?? '著者不明',
      cover_image_url:
        (item.volumeInfo.imageLinks?.thumbnail ?? item.volumeInfo.imageLinks?.smallThumbnail ?? null)
          ?.replace('http:', 'https:') ?? null,
      info_url: item.volumeInfo.infoLink ?? `https://books.google.com/books?id=${item.id}`,
    }))
    .slice(0, 12)

  return NextResponse.json(filtered)
}
