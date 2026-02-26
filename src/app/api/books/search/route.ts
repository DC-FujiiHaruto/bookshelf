import { NextResponse } from 'next/server'

type GoogleBooksItem = {
  id: string
  volumeInfo: {
    title?: string
    authors?: string[]
    imageLinks?: { thumbnail?: string }
    categories?: string[]
    pageCount?: number
  }
}

function mapItem(item: GoogleBooksItem) {
  return {
    google_books_id: item.id,
    title: item.volumeInfo.title ?? '（タイトル不明）',
    author: item.volumeInfo.authors?.join(', ') ?? '（著者不明）',
    cover_image_url: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') ?? null,
    genre: item.volumeInfo.categories?.[0] ?? null,
    total_pages: item.volumeInfo.pageCount ?? null,
  }
}

async function searchGoogle(q: string, apiKey: string, startIndex: number): Promise<GoogleBooksItem[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=40&startIndex=${startIndex}&key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) return []
  const json = await res.json()
  return json.items ?? []
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q) {
    return NextResponse.json({ error: 'query required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY ?? ''

  // タイトル・著者・キーワードをそれぞれ2ページ分（計6リクエスト）並列で取得
  // 1リクエスト最大40件 × 6 = 最大240件（重複除去後）
  const allResults = await Promise.all([
    searchGoogle(`intitle:${q}`, apiKey, 0),
    searchGoogle(`intitle:${q}`, apiKey, 40),
    searchGoogle(`inauthor:${q}`, apiKey, 0),
    searchGoogle(`inauthor:${q}`, apiKey, 40),
    searchGoogle(q, apiKey, 0),
    searchGoogle(q, apiKey, 40),
  ])

  // 優先順位: タイトル一致 → 著者一致 → キーワード一致 の順に重複除去してマージ
  const seen = new Set<string>()
  const merged: GoogleBooksItem[] = []

  for (const item of allResults.flat()) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      merged.push(item)
    }
  }

  return NextResponse.json(merged.map(mapItem))
}
