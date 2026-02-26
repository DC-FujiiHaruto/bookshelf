'use client'

import { useState } from 'react'

type Session = {
  date: string
  totalSeconds: number
}

type Props = {
  sessions: Session[]
}

function getCellClass(seconds: number): string {
  if (seconds === 0) return 'bg-amber-950 border border-amber-900/40'
  if (seconds < 900) return 'bg-amber-800/50'     // 1〜14分
  if (seconds < 1800) return 'bg-amber-700/70'    // 15〜29分
  if (seconds < 3600) return 'bg-amber-500'       // 30〜59分
  return 'bg-yellow-400'                           // 60分以上
}

function formatTime(seconds: number): string {
  if (seconds === 0) return '読書なし'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}時間${m}分`
  if (h > 0) return `${h}時間`
  return `${m}分`
}

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

export default function ReadingHeatmap({ sessions }: Props) {
  const [tooltip, setTooltip] = useState<{ date: string; seconds: number; x: number; y: number } | null>(null)

  const sessionMap = new Map(sessions.map((s) => [s.date, s.totalSeconds]))

  // 今年の1月1日の直前の日曜日を起点、12月31日を終点にする
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(today.getFullYear(), 0, 1) // 1月1日
  startDate.setDate(startDate.getDate() - startDate.getDay()) // 直前の日曜日に揃える
  const endDate = new Date(today.getFullYear(), 11, 31) // 12月31日

  // グリッドを生成
  const weeks: { date: Date; dateStr: string; seconds: number; isFuture: boolean }[][] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const week: { date: Date; dateStr: string; seconds: number; isFuture: boolean }[] = []
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split('T')[0]
      week.push({
        date: new Date(current),
        dateStr,
        seconds: sessionMap.get(dateStr) ?? 0,
        isFuture: current > today,
      })
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  // 月ラベルの位置を計算（各月の最初のセルが含まれる週）
  const monthPositions: { label: string; weekIndex: number }[] = []
  weeks.forEach((week, wi) => {
    const firstDay = week[0]?.date
    if (!firstDay) return
    if (firstDay.getDate() <= 7) {
      monthPositions.push({ label: MONTH_LABELS[firstDay.getMonth()], weekIndex: wi })
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-max">
        {/* 月ラベル行 */}
        <div className="flex mb-2 pl-6 h-5">
          {weeks.map((_, wi) => {
            const mp = monthPositions.find((m) => m.weekIndex === wi)
            return (
              <div key={wi} className="w-3.5 flex-shrink-0 relative">
                {mp && (
                  <span className="absolute bottom-0 text-[9px] text-amber-600 whitespace-nowrap">
                    {mp.label}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* グリッド本体 */}
        <div className="flex gap-0.5">
          {/* 曜日ラベル列 */}
          <div className="flex flex-col gap-0.5 mr-1 mt-1">
            {DAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={`w-4 h-3 flex items-center text-[8px] text-amber-700 ${i % 2 === 0 ? 'invisible' : ''}`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* セル列 */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5 mt-1">
              {week.map(({ dateStr, seconds, isFuture }) => (
                <div
                  key={dateStr}
                  className={`w-3 h-3 rounded-sm transition-colors ${getCellClass(isFuture ? 0 : seconds)}`}
                  onMouseEnter={(e) => {
                    if (!isFuture) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setTooltip({ date: dateStr, seconds, x: rect.left, y: rect.top })
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* 凡例 */}
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-amber-700 text-[10px]">少ない</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${
                level === 0 ? 'bg-amber-950 border border-amber-900/40' :
                level === 1 ? 'bg-amber-800/50' :
                level === 2 ? 'bg-amber-700/70' :
                level === 3 ? 'bg-amber-500' :
                'bg-yellow-400'
              }`}
            />
          ))}
          <span className="text-amber-700 text-[10px]">多い</span>
        </div>
      </div>

      {/* ツールチップ（fixed配置でスクロール追従しない簡易版） */}
      {tooltip && (
        <div
          className="fixed z-50 bg-amber-950 border border-amber-700 rounded px-2 py-1 text-xs text-amber-200 pointer-events-none shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y - 36 }}
        >
          {tooltip.date}　{formatTime(tooltip.seconds)}
        </div>
      )}
    </div>
  )
}
