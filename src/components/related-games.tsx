"use client"

import Link from "next/link"
import { SafeImage } from "./safe-image"

type RelatedGame = {
  id: string
  title: string
  coverImage: string | null
  originalWork: string | null
}

export function RelatedGames({ games }: { games: RelatedGame[] }) {
  if (games.length === 0) return null

  return (
    <div className="py-4 sm:py-6 lg:py-8">
      <h2 className="mb-3 text-base font-bold text-zinc-100 light:text-zinc-900">相关游戏推荐</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700 light:scrollbar-thumb-zinc-300">
        {games.map((g) => (
          <Link
            key={g.id}
            href={`/games/${g.id}`}
            className="group shrink-0 w-[140px] sm:w-[160px]"
          >
            <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-zinc-800 light:bg-zinc-200 ring-1 ring-white/[0.06] light:ring-black/[0.06] transition-all group-hover:ring-white/10 light:group-hover:ring-black/10 group-hover:scale-[1.02]">
              {g.coverImage ? (
                <SafeImage
                  src={g.coverImage}
                  alt={g.title}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs text-zinc-500 light:text-zinc-400">暂无封面</span>
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs font-medium text-zinc-300 light:text-zinc-700 line-clamp-2 group-hover:text-zinc-100 light:group-hover:text-zinc-900 transition-colors">
              {g.title}
            </p>
            {g.originalWork && (
              <p className="text-[10px] text-zinc-600 light:text-zinc-400 line-clamp-1">{g.originalWork}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}