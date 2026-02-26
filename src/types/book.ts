export type BookStatus = 'want_to_read' | 'reading' | 'read'

export const GENRE_MAP: Record<string, string> = {
  // 小説・文学
  'Fiction': '小説',
  'Literary Fiction': '文芸小説',
  'Literary Collections': '文学',
  'Literature': '文学',
  'Classics': '古典文学',
  'Short Stories': '短編小説',
  // ジャンル小説
  'Science Fiction': 'SF',
  'Mystery & Detective': 'ミステリー',
  'Mystery': 'ミステリー',
  'Detective': 'ミステリー',
  'Thrillers': 'スリラー',
  'Horror': 'ホラー',
  'Fantasy': 'ファンタジー',
  'Romance': 'ロマンス',
  'Historical Fiction': '歴史小説',
  'Action & Adventure': 'アクション・冒険',
  'Adventure': '冒険',
  'Humor': 'ユーモア',
  'Humor / General': 'ユーモア',
  // ノンフィクション
  'Nonfiction': 'ノンフィクション',
  'Non-Fiction': 'ノンフィクション',
  'Biography & Autobiography': '伝記・自伝',
  'Biography': '伝記',
  'Autobiography': '自伝',
  'History': '歴史',
  'True Crime': 'ノンフィクション犯罪',
  'Travel': '旅行',
  // ビジネス・経済
  'Business & Economics': 'ビジネス・経済',
  'Business': 'ビジネス',
  'Economics': '経済',
  'Management': 'マネジメント',
  'Self-Help': '自己啓発',
  'Personal Development': '自己啓発',
  'Motivational': '自己啓発',
  // 学術・専門
  'Science': '科学',
  'Technology & Engineering': 'テクノロジー',
  'Technology': 'テクノロジー',
  'Engineering': '工学',
  'Mathematics': '数学',
  'Philosophy': '哲学',
  'Psychology': '心理学',
  'Sociology': '社会学',
  'Social Science': '社会科学',
  'Political Science': '政治学',
  'Law': '法律',
  'Medical': '医学',
  'Health & Fitness': '健康・フィットネス',
  'Education': '教育',
  // アート・趣味
  'Art': 'アート',
  'Photography': '写真',
  'Music': '音楽',
  'Comics & Graphic Novels': 'マンガ・コミック',
  'Games & Activities': 'ゲーム',
  'Sports & Recreation': 'スポーツ',
  'Cooking': '料理',
  'Crafts & Hobbies': '趣味・クラフト',
  'Gardening': 'ガーデニング',
  // 宗教・思想
  'Religion': '宗教',
  'Body, Mind & Spirit': '精神・スピリチュアル',
  // 子ども・YA
  'Juvenile Fiction': '児童小説',
  'Juvenile Nonfiction': '児童ノンフィクション',
  'Young Adult Fiction': 'YA小説',
  'Young Adult Nonfiction': 'YAノンフィクション',
  // その他
  'Poetry': '詩',
  'Drama': 'ドラマ・戯曲',
  'Reference': 'リファレンス',
  'Computers': 'コンピュータ',
  'Language Arts & Disciplines': '語学・言語',
  'Foreign Language Study': '語学学習',
  'Nature': '自然',
  'Pets': 'ペット',
  'Family & Relationships': '家族・人間関係',
  'House & Home': '住まい・インテリア',
}

/** Google Books のジャンル文字列を日本語に変換する */
export function localizeGenre(genre: string): string {
  if (GENRE_MAP[genre]) return GENRE_MAP[genre]
  // "Fiction / Science Fiction" のようなスラッシュ区切りの先頭を試す
  const first = genre.split('/')[0].trim()
  return GENRE_MAP[first] ?? genre
}

export const EMOTION_TAGS = [
  '泣いた',
  '笑った',
  '感動した',
  '怖かった',
  '学んだ',
  '考えさせられた',
  'ワクワクした',
  '切なかった',
] as const

export type EmotionTag = typeof EMOTION_TAGS[number]

export type Book = {
  id: string
  user_id: string
  title: string
  author: string
  cover_image_url: string | null
  google_books_id: string | null
  genre: string | null
  total_pages: number | null
  status: BookStatus
  read_date: string | null
  rating: number | null
  impression: string | null
  emotion_tags: string[]
  sort_order: number | null
  current_page: number | null
  created_at: string
  updated_at: string
}
