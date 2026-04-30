"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Ann {
  id: string
  title: string
  content: string
  imageUrl: string
  link: string
}

export function AnnounceSwiper({ announcements }: { announcements: Ann[] }) {
  const [cur, setCur] = useState(0)
  const len = announcements.length

  const next = useCallback(() => setCur((i) => (i + 1) % len), [len])
  const prev = useCallback(() => setCur((i) => (i - 1 + len) % len), [len])

  useEffect(() => {
    if (len <= 1) return
    const t = setInterval(next, 4500)
    return () => clearInterval(t)
  }, [len, next])

  if (!len) return null

  const ann = announcements[cur]
  const href = ann.link || `/announcements/${ann.id}`

  return (
    <div className="relative h-[200px] w-full overflow-hidden rounded-2xl">
      {/* 背景图 */}
      <div
        className="absolute inset-0 bg-zinc-900 bg-cover bg-center transition-all duration-700"
        style={ann.imageUrl ? { backgroundImage: `url(${ann.imageUrl})` } : {}}
      />
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
      {ann.imageUrl && <div className="absolute inset-0 bg-zinc-950/40" />}

      {/* 内容链接（z-0，在按钮下层） */}
      <Link
        href={href}
        target={ann.link ? "_blank" : undefined}
        rel={ann.link ? "noopener noreferrer" : undefined}
        className="absolute inset-0 z-0 flex flex-col justify-end p-5"
      >
        <strong className="text-base font-bold leading-snug text-white line-clamp-1">
          {ann.title}
        </strong>
        <p className="mt-1 text-xs leading-relaxed text-white/75 line-clamp-2">
          {ann.content.slice(0, 90)}{ann.content.length > 90 ? "…" : ""}
        </p>
        <span className="mt-2 text-[11px] font-medium text-white/60">
          {ann.link ? "点击跳转 →" : "查看公告 →"}
        </span>
      </Link>

      {/* 翻页按钮（z-10，在 Link 上层） */}
      {len > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev() }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white/70 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next() }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white/70 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* 分页点 */}
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {announcements.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setCur(i) }}
                className={`h-1.5 rounded-full transition-all ${i === cur ? "w-4 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
