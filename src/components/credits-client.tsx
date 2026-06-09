"use client"

import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

interface Creator {
  id: string
  name: string
  nameJa: string | null
  avatar: string | null
  role: string
}

interface CreditGame {
  id: string
  serialId: number
  title: string
  coverImage: string
  createdAt: string
  creators: Creator[]
}

const ROLE_LABELS: Record<string, string> = {
  scenario: "脚本",
  art: "原画",
  chardesign: "角色设计",
  music: "音乐",
  songs: "主题曲",
  director: "导演",
  other: "其他",
}

const ROLES = [
  { key: "all", label: "全部" },
  { key: "scenario", label: "脚本" },
  { key: "art", label: "原画" },
  { key: "chardesign", label: "角色设计" },
  { key: "music", label: "音乐" },
  { key: "songs", label: "主题曲" },
  { key: "director", label: "导演" },
]

export function CreditsClient() {
  const [games, setGames] = useState<CreditGame[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchGames = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (role !== "all") params.set("role", role)
      if (search) params.set("search", search)

      const res = await fetch(`/api/credits?${params}`)
      const data = await res.json()
      setGames(data.games || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch {
      setGames([])
    } finally {
      setLoading(false)
    }
  }, [page, role, search])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  // 搜索防抖
  const [searchInput, setSearchInput] = useState("")
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* 标题区域 - 极简 */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          制作组图鉴
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          探索作品背后的创作者
        </p>
      </div>

      {/* 搜索 + 筛选 - 一行 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="搜索..."
            className="w-full rounded-lg bg-muted/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 ring-1 ring-border outline-none focus:ring-foreground/20 transition-all"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {ROLES.map(r => (
            <button
              key={r.key}
              onClick={() => { setRole(r.key); setPage(1) }}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                role === r.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 统计 */}
      {!loading && (
        <p className="text-xs text-muted-foreground mb-6">
          {total} 个游戏
        </p>
      )}

      {/* 游戏列表 */}
      {loading ? (
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse h-20 rounded-lg bg-muted/30" />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">暂无数据</p>
        </div>
      ) : (
        <div className="space-y-1">
          {games.map(game => (
            <div
              key={game.id}
              className="group rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4 p-3">
                {/* 封面 */}
                <Link href={`/games/${game.serialId}`} className="shrink-0">
                  {game.coverImage ? (
                    <div className="relative h-14 w-10 rounded overflow-hidden">
                      <Image
                        src={game.coverImage}
                        alt={game.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-10 rounded bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground/50">?</span>
                    </div>
                  )}
                </Link>

                {/* 游戏信息 */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/games/${game.serialId}`}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block"
                  >
                    {game.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {game.creators.length} 位创作者
                  </p>
                </div>

                {/* 创作者列表 - 横向滚动 */}
                <div className="hidden sm:flex items-center gap-2 overflow-x-auto max-w-[500px] scrollbar-hide">
                  {game.creators.slice(0, 6).map(c => (
                    <Link
                      key={`${c.id}-${c.role}`}
                      href={`/creators/${c.id}`}
                      className="flex items-center gap-1.5 shrink-0 group/creator"
                    >
                      {c.avatar ? (
                        <Image
                          src={c.avatar}
                          alt={c.name}
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-[10px] text-muted-foreground">
                            {(c.nameJa || c.name)[0]}
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground group-hover/creator:text-foreground transition-colors whitespace-nowrap">
                        {c.nameJa || c.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50">
                        {ROLE_LABELS[c.role] || c.role}
                      </span>
                    </Link>
                  ))}
                  {game.creators.length > 6 && (
                    <span className="text-xs text-muted-foreground/50">
                      +{game.creators.length - 6}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
          >
            ←
          </button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
