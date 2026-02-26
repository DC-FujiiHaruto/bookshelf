'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Square, Minimize2, Maximize2, X, BookOpen, Timer } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Book } from '@/types/book'

type Props = {
  book: Book
  userId: string
  onClose: () => void
}

export default function FloatingTimer({ book, userId, onClose }: Props) {
  const [minimized, setMinimized] = useState(false)
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
      .insert({ book_id: book.id, user_id: userId, started_at: new Date().toISOString() })
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
      .update({ ended_at: new Date().toISOString(), duration_seconds: elapsed })
      .eq('id', sessionId)
    setSessionId(null)
    setElapsed(0)
  }

  const handleClose = async () => {
    if (running && sessionId) await handleStop()
    onClose()
  }

  if (minimized) {
    return (
      <div
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-amber-900 border border-amber-700 rounded-full px-4 py-2.5 shadow-xl cursor-pointer hover:bg-amber-800 transition-colors"
        onClick={() => setMinimized(false)}
      >
        <Timer className="w-4 h-4 text-amber-400 flex-shrink-0" />
        {running ? (
          <span className="text-green-400 font-mono text-sm font-bold">{formatTime(elapsed)}</span>
        ) : (
          <span className="text-amber-300 text-sm truncate max-w-28">{book.title.slice(0, 12)}</span>
        )}
        <Maximize2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
      </div>
    )
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-64 bg-amber-900 border border-amber-700 rounded-2xl shadow-2xl overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-amber-800/80 px-4 py-2.5 flex items-center justify-between border-b border-amber-700/50">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-amber-400 flex-shrink-0" strokeWidth={1.5} />
          <span className="text-amber-100 text-xs font-semibold truncate">{book.title}</span>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => setMinimized(true)}
            className="text-amber-500 hover:text-amber-300 transition-colors p-1.5 rounded"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClose}
            className="text-amber-500 hover:text-amber-300 transition-colors p-1.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* タイマー表示 */}
      <div className="p-5">
        <div className="text-center mb-5">
          <span className={`font-mono text-4xl font-bold tracking-widest ${running ? 'text-green-400' : 'text-amber-300'}`}>
            {formatTime(elapsed)}
          </span>
          {running && (
            <div className="flex justify-center mt-1">
              <span className="flex items-center gap-1 text-green-500 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                読書中
              </span>
            </div>
          )}
        </div>

        {running ? (
          <button
            onClick={handleStop}
            className="w-full flex items-center justify-center gap-2 bg-red-900/70 hover:bg-red-900 text-red-300 font-semibold py-2.5 rounded-full transition-colors"
          >
            <Square className="w-4 h-4" />
            読書終了
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-2 bg-green-900/70 hover:bg-green-800 text-green-300 font-semibold py-2.5 rounded-full transition-colors"
          >
            <Play className="w-4 h-4" />
            読書開始
          </button>
        )}
      </div>
    </div>
  )
}
