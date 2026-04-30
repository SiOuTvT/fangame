"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, Heart } from "lucide-react"

export interface GameCardData {
  id: string
  title: string
  coverImage: string
  description?: string
  tags: { name: string; color: string }[]
  favoriteCount: number
  viewCount?: number
  isNsfw: boolean
  status: string
  createdAt?: Date | string
}

const STATUS_CLS: Record<string, string> = {
  完结:   "bg-emerald-500/15 text-emerald-400",
  连载中: "bg-sky-500/15 text-sky-400",
  已弃坑: "bg-red-500/15 text-red-400",
}

function isNew(createdAt?: Date | string) {
  if (!createdAt) return false
  return Date.now() - new Date(createdAt).getTime() < 7 * 86400_000
}

export function GameCard({ game }: { game: GameCardData }) {
  const router = useRouter()
  const [showPreview, setShowPreview] = useState(false)
  const [previewPos, setPreviewPos]   = useState<"left" | "right">("right")
  const cardRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleMouseEnter() {
    timerRef.current = setTimeout(() => {
      // 判断卡片在屏幕左半还是右半，决定预览弹窗方向
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        setPreviewPos(rect.left > window.innerWidth / 2 ? "left" : "right")
      }
      setShowPreview(true)
    }, 400) // 400ms 延迟，避免快速划过触发
  }

  function handleMouseLeave() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setShowPreview(false)
  }

  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/games/${game.id}`}
        className="group relative block overflow-hidden rounded-[14px] border border-white/[0.08] bg-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-white/[0.14] hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        style={{ aspectRatio: "5/6" }}
      >
        {/* 封面区（上方 60%） */}
        <div className="absolute inset-0 bottom-[40%] overflow-hidden bg-zinc-800">
          {game.coverImage ? (
            <Image
              src={game.coverImage}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.06]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-700 text-xs">暂无封面</div>
          )}

          {game.isNsfw && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/65 backdrop-blur-[6px] transition-opacity duration-300 group-hover:opacity-0">
              <span className="rounded border border-red-500/40 bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">NSFW</span>
            </div>
          )}
          {isNew(game.createdAt) && (
            <span className="absolute left-1.5 top-1.5 gradient-accent rounded px-1.5 py-0.5 text-[9px] font-bold text-white">NEW</span>
          )}
          <span className={`absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-medium ${STATUS_CLS[game.status] ?? "bg-zinc-800/80 text-zinc-400"}`}>
            {game.status}
          </span>
        </div>

        {/* 信息条（下方 40%） */}
        <div className="absolute inset-x-0 bottom-0 flex h-[40%] flex-col justify-center gap-1.5 bg-zinc-900 px-2.5 py-2">
          <p className="line-clamp-2 text-[12px] font-bold leading-snug text-zinc-100">{game.title}</p>
          <div className="flex flex-wrap gap-1">
            {game.tags.slice(0, 2).map((tag) => (
              <span key={tag.name} className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                style={{ color: tag.color, background: `${tag.color}18`, outline: `1px solid ${tag.color}40` }}>
                {tag.name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 text-[10px] text-zinc-500">
              <Eye className="h-3 w-3" strokeWidth={2} />{game.viewCount ?? 0}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-zinc-500">
              <Heart className="h-3 w-3" strokeWidth={2} />{game.favoriteCount}
            </span>
          </div>
        </div>
      </Link>

      {/* Hover 预览弹窗 */}
      {showPreview && (
        <div
          className={[
            "pointer-events-none absolute top-0 z-50 w-56 overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-900/98 shadow-2xl backdrop-blur-xl",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            previewPos === "right" ? "left-[calc(100%+8px)]" : "right-[calc(100%+8px)]",
          ].join(" ")}
        >
          {/* 封面 */}
          {game.coverImage && (
            <div className="relative h-32 w-full overflow-hidden">
              <Image src={game.coverImage} alt={game.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
            </div>
          )}

          <div className="p-3 space-y-2">
            <p className="text-sm font-bold text-zinc-100 leading-snug">{game.title}</p>

            {/* 简介 */}
            {game.description && (
              <p className="text-[11px] leading-relaxed text-zinc-500 line-clamp-3">{game.description}</p>
            )}

            {/* 标签（可点击） */}
            {game.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {game.tags.map((tag) => (
                  <button
                    key={tag.name}
                    className="pointer-events-auto rounded-full px-2 py-0.5 text-[10px] font-medium transition-opacity hover:opacity-70"
                    style={{ color: tag.color, background: `${tag.color}20`, outline: `1px solid ${tag.color}40` }}
                    onClick={(e) => { e.preventDefault(); router.push(`/search?tag=${encodeURIComponent(tag.name)}`) }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}

            {/* 数据 */}
            <div className="flex items-center gap-3 pt-1 border-t border-white/[0.06]">
              <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                <Eye className="h-3 w-3" strokeWidth={1.5} />{game.viewCount ?? 0}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                <Heart className="h-3 w-3" strokeWidth={1.5} />{game.favoriteCount}
              </span>
              <span className={`ml-auto rounded px-1.5 py-0.5 text-[9px] font-medium ${STATUS_CLS[game.status] ?? "bg-zinc-800 text-zinc-400"}`}>
                {game.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function GameCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[14px]" style={{ aspectRatio: "5/6" }}>
      <div className="h-[60%] w-full skeleton-shimmer" />
      <div className="h-[40%] bg-zinc-900 px-2.5 py-2 space-y-1.5">
        <div className="h-3 w-4/5 rounded skeleton-shimmer" />
        <div className="h-2.5 w-1/2 rounded skeleton-shimmer" />
      </div>
    </div>
  )
}
