"use client"

import DOMPurify from "isomorphic-dompurify"
import Image from "next/image"

/* ─── 制作人员 ─── */
type Creator = {
  id: string
  name: string
  nameJa: string | null
  avatar: string | null
  role: string
}

interface IntroTabProps {
  description: string | null
  creators?: Creator[]
  roleLabels?: Record<string, string>
}

export function IntroTab({ description, creators = [], roleLabels }: IntroTabProps) {
  return (
    <div className="space-y-6">
      {/* 游戏简介 */}
      {description ? (
        <div
          className="prose prose-sm prose-invert max-w-none text-muted-foreground leading-relaxed"
          style={{ fontSize: "14px", lineHeight: "1.85" }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(description, {
              ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "a", "img", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "code", "pre", "hr", "div", "span", "table", "thead", "tbody", "tr", "th", "td"],
              ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class", "style", "width", "height"],
              ALLOW_DATA_ATTR: false,
            }),
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground/60 italic">暂无简介</p>
      )}

      {/* 制作人员网格 */}
      {creators.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">制作人员</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {creators.map((c) => (
              <a
                key={`${c.id}-${c.role}`}
                href={`/creators/${c.id}`}
                className="flex items-center gap-2.5 rounded-xl bg-card p-3 ring-1 ring-border transition-all hover:ring-primary/40 hover:shadow-sm"
              >
                {c.avatar ? (
                  <Image
                    src={c.avatar}
                    alt={c.name}
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {(c.nameJa || c.name)[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{c.nameJa || c.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {roleLabels?.[c.role] ?? c.role}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
