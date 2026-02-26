'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  bookId: string
  userId: string
  totalSeconds: number
}

export default function ReadingTimer({ bookId, userId, totalSeconds }: Props) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const handleStart = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reading_sessions')
      .insert({ book_id: bookId, user_id: userId, started_at: new Date().toISOString() })
      .select('id')
      .single()
    if (data) {
      setSessionId(data.id)
      setElapsed(0)
      setRunning(true)
    }
  }

  const handleStop = async () => {
    if (!sessionId) return
    setRunning(false)
    const supabase = createClient()
    await supabase
      .from('reading_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: elapsed,
      })
      .eq('id', sessionId)
    setSessionId(null)
    setElapsed(0)
  }

  const totalHours = Math.floor(totalSeconds / 3600)
  const totalMins = Math.floor((totalSeconds % 3600) / 60)

  return (
    <div className="bg-amber-950/60 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-amber-400 text-xs">累計読書時間</span>
        <span className="text-amber-200 text-xs font-semibold">
          {totalHours > 0 ? `${totalHours}時間${totalMins}分` : `${totalMins}分`}
        </span>
      </div>

      {running ? (
        <div className="flex items-center justify-between">
          <span className="text-green-400 font-mono text-lg font-bold">{formatTime(elapsed)}</span>
          <button
            onClick={handleStop}
            className="bg-red-700 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            読書終了
          </button>
        </div>
      ) : (
        <button
          onClick={handleStart}
          className="w-full bg-green-800 hover:bg-green-700 text-green-200 text-sm font-semibold py-2 rounded-full transition-colors"
        >
          ▶ 読書開始
        </button>
      )}
    </div>
  )
}
