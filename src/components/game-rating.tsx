"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  gameId: string
  isLoggedIn: boolean
}

export function GameRating({ gameId, isLoggedIn }: Props) {
  const [avg, setAvg]       = useState<number>(0)
  const [count, setCount]   = useState(0)
  const [mine, setMine]     = useState<number | null>(null)
  const [hover, setHover]   = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/games/${gameId}/rating`)
      .then(r => r.json())
      .then(d => { setAvg(d.avg); setCount(d.count); setMine(d.mine) })
  }, [gameId])

  async function rate(score: number) {
    if (!isLoggedIn || saving) return
    setSaving(true)
    const res = await fetch(`/api/games/${gameId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score }),
    })
    const data = await res.json()
    if (res.ok) { setAvg(data.avg); setCount(data.count); setMine(data.mine) }
    setSaving(false)
  }

  const display = hover ?? mine ?? 0

  return (
    <div className="flex items-center gap-3">
      {/* 星星 */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            disabled={!isLoggedIn || saving}
            onClick={() => rate(s)}
            onMouseEnter={() => isLoggedIn && setHover(s)}
            onMouseLeave={() => setHover(null)}
            className={cn(
              "transition-transform",
              isLoggedIn && !saving ? "hover:scale-110 cursor-pointer" : "cursor-default"
            )}
          >
            <Star
              className={cn(
                "h-5 w-5 transition-colors",
                s <= display
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-zinc-600"
              )}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>

      {/* 数据 */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        {avg > 0 && <span className="font-semibold text-amber-400">{avg}</span>}
        <span>{count > 0 ? `${count} 人评分` : "暂无评分"}</span>
        {mine && <span className="text-zinc-700">· 我的评分 {mine}★</span>}
      </div>

      {!isLoggedIn && (
        <span className="text-[11px] text-zinc-700">登录后可评分</span>
      )}
    </div>
  )
}
