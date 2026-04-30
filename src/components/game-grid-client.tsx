"use client"

import { useState, useTransition } from "react"
import { GameCard, type GameCardData } from "@/components/game-card"
import { Loader2, ChevronDown } from "lucide-react"

interface Props {
  initialGames: GameCardData[]
  total: number
  tag: string
  q: string
  nsfw: boolean
}

export function GameGridClient({ initialGames, total, tag, q, nsfw }: Props) {
  const [games, setGames]   = useState(initialGames)
  const [page, setPage]     = useState(1)
  const [pending, startTransition] = useTransition()

  const hasMore = games.length < total

  function loadMore() {
    startTransition(async () => {
      const params = new URLSearchParams()
      params.set("page", String(page + 1))
      params.set("limit", "24")
      if (q)   params.set("q",    q)
      if (tag && tag !== "全部") params.set("tag", tag)
      if (nsfw) params.set("nsfw", "1")

      const res  = await fetch(`/api/games?${params}`)
      const data = await res.json()
      setGames(prev => [...prev, ...data.games])
      setPage(p => p + 1)
    })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={pending}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm text-zinc-400 ring-1 ring-white/[0.06] transition-all hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
          >
            {pending
              ? <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />加载中…</>
              : <><ChevronDown className="h-4 w-4" strokeWidth={1.5} />加载更多（还有 {total - games.length} 个）</>
            }
          </button>
        </div>
      )}

      {!hasMore && games.length > 0 && (
        <p className="mt-6 text-center text-xs text-zinc-700">— 已加载全部 {total} 个游戏 —</p>
      )}
    </>
  )
}
