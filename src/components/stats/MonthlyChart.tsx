'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Book } from '@/types/book'

type Props = { books: Book[]; year: number }

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export default function MonthlyChart({ books, year }: Props) {
  const data = MONTHS.map((month, i) => {
    const m = String(i + 1).padStart(2, '0')
    const count = books.filter((b) => b.read_date?.startsWith(`${year}-${m}`)).length
    return { month, count }
  })

  if (books.length === 0) {
    return <p className="text-amber-500 text-sm text-center py-4">読了本がまだありません</p>
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="month" tick={{ fill: '#d97706', fontSize: 11 }} />
        <YAxis tick={{ fill: '#d97706', fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#451a03', border: '1px solid #78350f', borderRadius: 8 }}
          labelStyle={{ color: '#fde68a' }}
          itemStyle={{ color: '#fbbf24' }}
          formatter={(value) => [`${value}冊`, '読了']}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.count > 0 ? '#f59e0b' : '#78350f'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
