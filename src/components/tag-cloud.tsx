"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type Tag = { id: string; name: string; color: string }

export function TagCloud({
  tags,
  activeTag,
  buildHref,
}: {
  tags: Tag[]
  activeTag: string
  buildHref: (overrides: Record<string, string>) => string
}) {
  const [expanded, setExpanded] = useState(false)
  const VISIBLE_COUNT = 10
  const visibleTags = expanded ? tags : tags.slice(0, VISIBLE_COUNT)

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <Link
          href={buildHref({ tag: "" })}
          className={[
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium leading-none transition-all",
            !activeTag
              ? "bg-zinc-700 text-zinc-100 ring-1 ring-zinc-600"
              : "bg-zinc-900 text-zinc-500 ring-1 ring-white/[0.06] hover:bg-zinc-800 hover:text-zinc-300",
          ].join(" ")}
        >
          全部
        </Link>
        {visibleTags.map((t) => (
          <Link
            key={t.id}
            href={buildHref({ tag: t.name })}
            className={[
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium leading-none transition-all ring-1",
              activeTag === t.name ? "opacity-100" : "opacity-50 hover:opacity-80",
            ].join(" ")}
            style={
              activeTag === t.name
                ? { color: t.color, background: `${t.color}20`, outlineColor: t.color }
                : { color: t.color, background: `${t.color}10`, borderColor: `${t.color}30` }
            }
          >
            {t.name}
          </Link>
        ))}
      </div>
      {tags.length > VISIBLE_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="mt-2 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {expanded ? "收起" : `展开全部 (${tags.length})`}
          <ChevronDown
            className="h-3 w-3 transition-transform duration-200"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>
      )}
    </div>
  )
}