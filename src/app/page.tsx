import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { GameCardSkeleton } from "@/components/game-card"
import { GameGridClient } from "@/components/game-grid-client"
import { AnnounceSwiper } from "@/components/announce-swiper"
import { RandomGameBtn } from "@/components/random-game-btn"
import { buildGameSearchFilter } from "@/lib/filters"

function GameGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => <GameCardSkeleton key={i} />)}
    </div>
  )
}

async function GameGridServer({ tag, q, nsfw }: { tag: string; q: string; nsfw: boolean }) {
  const where = buildGameSearchFilter({ q, tag, nsfw })

  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 24,
      select: {
        id: true, title: true, coverImage: true, status: true,
        isNsfw: true, favoriteCount: true, viewCount: true, createdAt: true,
        description: true,
        tags: { select: { tag: { select: { name: true, color: true } } } },
      },
    }),
    prisma.game.count({ where }),
  ])

  if (!games.length) {
    return <div className="py-20 text-center text-sm text-zinc-600">暂无游戏资源，管理员快去添加吧~</div>
  }

  const mapped = games.map(g => ({ ...g, tags: g.tags.map(t => t.tag) }))

  return <GameGridClient initialGames={mapped} total={total} tag={tag} q={q} nsfw={nsfw} />
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; nsfw?: string }>
}) {
  const sp        = await searchParams
  const q         = sp.q?.trim() || ""
  const activeTag = sp.tag || "全部"
  const nsfw      = sp.nsfw === "1"

  const [tags, total, announcements] = await Promise.all([
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.game.count({ where: { isPublished: true, ...(nsfw ? {} : { isNsfw: false }) } }),
    prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, content: true, imageUrl: true, link: true },
    }),
  ])

  const allTags = ["全部", ...tags.map((t) => t.name)]

  return (
    <div className="flex flex-col gap-5">

      {/* 顶部双栏：左侧留白 + 右侧公告轮播 */}
      <div className="flex gap-4" style={{ height: 200 }}>
        <div className="hidden w-56 shrink-0 md:block" />
        <div className="flex-1 overflow-hidden">
          {announcements.length > 0
            ? <AnnounceSwiper announcements={announcements} />
            : <div className="h-full w-full animate-pulse rounded-2xl bg-zinc-900" />
          }
        </div>
      </div>

      {/* 标签筛选 */}
      <div className="flex flex-wrap gap-1.5">
        {allTags.map((tag) => (
          <Link
            key={tag}
            href={`/?tag=${encodeURIComponent(tag)}${q ? `&q=${encodeURIComponent(q)}` : ""}${nsfw ? "&nsfw=1" : ""}`}
            className={[
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all",
              activeTag === tag
                ? "bg-pink-500 text-white"
                : "border border-white/[0.08] bg-zinc-900 text-zinc-500 hover:border-white/[0.14] hover:text-zinc-300",
            ].join(" ")}
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* 游戏网格 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">
            {q ? `「${q}」的搜索结果` : activeTag === "全部" ? "最新资源" : `# ${activeTag}`}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600">共 {total} 个游戏</span>
            <RandomGameBtn />
          </div>
        </div>
        <Suspense fallback={<GameGridSkeleton />}>
          <GameGridServer tag={activeTag} q={q} nsfw={nsfw} />
        </Suspense>
      </section>

    </div>
  )
}
