import { GameCard, GameCardSkeleton } from "@/components/game-card"
import { SearchBar } from "@/components/search-bar"
import { TagCloud } from "@/components/tag-cloud"
import { prisma } from "@/lib/prisma"
import { ChevronDown, Clock, Heart, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

type SortKey = "newest" | "popular" | "mostFaved"

const SORT_OPTIONS: { key: SortKey; label: string; icon: typeof Clock }[] = [
  { key: "newest",    label: "最新",   icon: Clock },
  { key: "popular",  label: "最热",   icon: TrendingUp },
  { key: "mostFaved",label: "最多收藏", icon: Heart },
]

const ORDER_MAP: Record<SortKey, object> = {
  newest:    { createdAt: "desc" },
  popular:   { viewCount: "desc" },
  mostFaved: { favoriteCount: "desc" },
}

async function SearchResults({
  q, tag, sort, nsfw,
}: {
  q: string; tag: string; sort: SortKey; nsfw: boolean
}) {
  const where = {
    isPublished: true,
    ...(nsfw ? {} : { isNsfw: false }),
    ...(q && {
      OR: [
        { title:        { contains: q, mode: "insensitive" as const } },
        { originalWork: { contains: q, mode: "insensitive" as const } },
        { englishName:  { contains: q, mode: "insensitive" as const } },
        { aliases:      { contains: q, mode: "insensitive" as const } },
        { description:  { contains: q, mode: "insensitive" as const } },
        { tags: { some: { tag: { name: { contains: q, mode: "insensitive" as const } } } } },
      ],
    }),
    ...(tag && { tags: { some: { tag: { name: tag } } } }),
  }

  const games = await prisma.game.findMany({
    where,
    orderBy: ORDER_MAP[sort],
    take: 60,
      select: {
      id: true, title: true, coverImage: true, status: true,
      isNsfw: true, favoriteCount: true, viewCount: true,
      downloadCount: true, platform: true, language: true, fileSize: true,
      updatedAt: true, createdAt: true,
      tags: { select: { tag: { select: { name: true, color: true } } } },
    },
  })

  if (!games.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-zinc-500">
          {q ? `没有找到与「${q}」相关的游戏` : "没有符合条件的游戏"}
        </p>
        {q && (
          <Link href="/search" className="mt-3 inline-block text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            清除搜索条件
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <p className="mb-4 text-xs text-zinc-600">找到 {games.length} 个结果</p>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 items-stretch">
        {games.map((game) => (
          <GameCard key={game.id} game={{ ...game, tags: game.tags.map((t: any) => t.tag) }} />
        ))}
      </div>
    </>
  )
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 items-stretch">
      {Array.from({ length: 12 }).map((_, i) => <GameCardSkeleton key={i} />)}
    </div>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; sort?: string; nsfw?: string }>
}) {
  const sp    = await searchParams
  const q     = sp.q?.trim() ?? ""
  const tag   = sp.tag?.trim() ?? ""
  const sort  = (sp.sort as SortKey) ?? "newest"
  const nsfw  = sp.nsfw === "1"

  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } })

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams()
    if (q)    p.set("q",    q)
    if (tag)  p.set("tag",  tag)
    if (sort !== "newest") p.set("sort", sort)
    if (nsfw) p.set("nsfw", "1")
    Object.entries(overrides).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k))
    const s = p.toString()
    return `/search${s ? `?${s}` : ""}`
  }

  return (
    <div className="space-y-5">
      {/* 搜索框 */}
      <SearchBar defaultValue={q} />

        {/* 标签云（折叠） */}
      <TagCloud tags={tags} activeTag={tag} buildHref={buildHref} />

      {/* 排序 + 结果标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-300">
          {q && tag
            ? `「${q}」· ${tag}`
            : q
            ? `「${q}」的搜索结果`
            : tag
            ? `# ${tag}`
            : "全部游戏"}
        </h2>

        {/* 桌面端：按钮排序 */}
        <div className="hidden sm:flex items-center gap-1">
          {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
            <Link
              key={key}
              href={buildHref({ sort: key })}
              className={[
                "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                sort === key
                  ? "bg-zinc-800 text-zinc-200"
                  : "text-zinc-600 hover:text-zinc-400",
              ].join(" ")}
            >
              <Icon className="h-3 w-3" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </div>
        {/* 移动端：下拉排序 */}
        <div className="sm:hidden relative group">
          <Link
            href={buildHref({ sort: sort })}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 bg-zinc-800/50"
          >
            {SORT_OPTIONS.find(o => o.key === sort)?.label ?? "排序"}
            <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
          </Link>
          <div className="absolute right-0 top-full z-50 mt-1 hidden group-hover:block w-28 overflow-hidden rounded-lg py-1 shadow-lg bg-zinc-900 border border-zinc-800">
            {SORT_OPTIONS.map(({ key, label }) => (
              <Link
                key={key}
                href={buildHref({ sort: key })}
                className={[
                  "flex items-center px-3 py-2 text-xs transition-colors",
                  sort === key ? "bg-zinc-800 text-zinc-200" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50",
                ].join(" ")}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 结果网格 */}
      <Suspense fallback={<ResultsSkeleton />}>
        <SearchResults q={q} tag={tag} sort={sort} nsfw={nsfw} />
      </Suspense>
    </div>
  )
}
