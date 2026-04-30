"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shuffle, Loader2 } from "lucide-react"

export function RandomGameBtn() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  async function go() {
    setLoading(true)
    // 优先随机创作者，没有则随机游戏
    const res  = await fetch("/api/creators/random")
    const data = await res.json()
    if (data.id) {
      router.push(`/creators/${data.id}`)
    } else {
      const res2  = await fetch("/api/games/random")
      const data2 = await res2.json()
      if (data2.id) router.push(`/games/${data2.id}`)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={go}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-1.5 text-xs text-zinc-500 ring-1 ring-white/[0.06] transition-all hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-50"
    >
      {loading
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
        : <Shuffle className="h-3.5 w-3.5" strokeWidth={1.5} />
      }
      随机发现
    </button>
  )
}
