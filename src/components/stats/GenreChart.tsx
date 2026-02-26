'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Book } from '@/types/book'

type Props = { books: Book[] }

const COLORS = ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24', '#fcd34d', '#fde68a']

export default function GenreChart({ books: rawBooks }: Props) {
  const books = rawBooks.filter((b) => b.genre)

  if (books.length === 0) {
    return <p className="text-amber-500 text-sm text-center py-4">ジャンルデータがありません</p>
  }

  const counts: Record<string, number> = {}
  for (const b of books) {
    const g = b.genre!
    counts[g] = (counts[g] ?? 0) + 1
  }

  const data = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#451a03', border: '1px solid #78350f', borderRadius: 8 }}
          itemStyle={{ color: '#fbbf24' }}
          formatter={(value) => [`${value}冊`]}
        />
        <Legend wrapperStyle={{ color: '#d97706', fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
