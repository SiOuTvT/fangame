"use client"

import DOMPurify from "isomorphic-dompurify"
import { Building2, Calendar, ChevronDown, Clock, ExternalLink, Gamepad2, Users } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { Tag } from "@/components/ui/tag"

/* ═══════════════════════════════════════════════
   语言优先级：中文 > English > 日本語 > 其他
   ═══════════════════════════════════════════════ */
const LANG_PRIORITY = ["zh", "en", "ja", "other"]

function getDefaultLang(descriptions: { lang: string }[]): string {
  for (const lang of LANG_PRIORITY) {
    if (descriptions.some((d) => d.lang === lang)) return lang
  }
  return descriptions[0]?.lang ?? ""
}

/* ═══════════════════════════════════════════════
   Sanitize 配置（复用）
   ═══════════════════════════════════════════════ */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "a", "img", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "code", "pre", "hr", "div", "span"],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class"],
  ALLOW_DATA_ATTR: false,
}

function DescriptionContent({ html }: { html: string }) {
  return (
    <div
      className="prose dark:prose-invert max-w-none leading-relaxed"
      style={{ fontSize: "15px", lineHeight: "1.9", color: "var(--foreground)" }}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html, SANITIZE_CONFIG) }}
    />
  )
}

/* ═══════════════════════════════════════════════
   语言 Segmented Tab
   ═══════════════════════════════════════════════ */
function LangTabs({
  descriptions,
  activeLang,
  onChange,
}: {
  descriptions: { lang: string; label: string }[]
  activeLang: string
  onChange: (lang: string) => void
}) {
  const barRef = useRef<HTMLDivElement>(null)

  // 横向滚动到激活项
  useEffect(() => {
    if (!barRef.current) return
    const active = barRef.current.querySelector(`[data-lang="${activeLang}"]`) as HTMLElement | null
    if (active) {
      const bar = barRef.current
      const left = active.offsetLeft - bar.offsetWidth / 2 + active.offsetWidth / 2
      bar.scrollTo({ left, behavior: "smooth" })
    }
  }, [activeLang])

  return (
    <div
      ref={barRef}
      className="flex items-center gap-1 overflow-x-auto scrollbar-hide"
      role="tablist"
      aria-label="简介语言切换"
    >
      {descriptions.map((d) => {
        const isActive = d.lang === activeLang
        return (
          <button
            key={d.lang}
            type="button"
            role="tab"
            data-lang={d.lang}
            aria-selected={isActive}
            onClick={() => onChange(d.lang)}
            className={`
              shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition-all duration-150
              ${isActive
                ? "bg-primary/15 text-primary ring-1 ring-primary/25"
                : "text-muted-foreground hover:text-foreground ring-1 ring-border hover:ring-foreground/20"
              }
            `}
          >
            {d.label}
          </button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   IntroTab — 游戏简介 + 制作人员
   ═══════════════════════════════════════════════ */

export function IntroTab({
  description,
  allDescriptions,
  creators,
}: {
  description: string
  allDescriptions?: { lang: string; label: string; text: string }[]
  creators: {
    id: string
    role: string
    name: string
    avatar?: string | null
    nameJa?: string | null
    aliases?: string[]
  }[]
}) {
  const hasMultiple = allDescriptions && allDescriptions.length > 1
  const [activeLang, setActiveLang] = useState(() =>
    allDescriptions ? getDefaultLang(allDescriptions) : ""
  )
  const [fading, setFading] = useState(false)

  const switchLang = useCallback(
    (lang: string) => {
      if (lang === activeLang) return
      setFading(true)
      // 淡出 → 切换 → 淡入
      setTimeout(() => {
        setActiveLang(lang)
        setFading(false)
      }, 150)
    },
    [activeLang]
  )

  // 单语言或无 allDescriptions 时直接渲染
  if (!allDescriptions || allDescriptions.length === 0) {
    return (
      <div role="tabpanel" id="tabpanel-intro" aria-labelledby="tab-intro">
        {description ? (
          <DescriptionContent html={description} />
        ) : (
          <p className="text-sm text-muted-foreground/60 italic">暂无简介</p>
        )}
        {creators.length > 0 && (
          <div className="mt-5">
            <CollapsibleCard
              icon={<Users className="h-4 w-4 opacity-60" />}
              label="制作人员"
              count={creators.length}
              defaultOpen={creators.length <= 5}
            >
              <CreatorsGrid creators={creators} />
            </CollapsibleCard>
          </div>
        )}
      </div>
    )
  }

  const activeDesc = allDescriptions.find((d) => d.lang === activeLang) ?? allDescriptions[0]

  return (
    <div role="tabpanel" id="tabpanel-intro" aria-labelledby="tab-intro">
      {/* 语言切换 Tab — 仅多语言时显示 */}
      {hasMultiple && (
        <div className="mb-4">
          <LangTabs
            descriptions={allDescriptions}
            activeLang={activeLang}
            onChange={switchLang}
          />
        </div>
      )}

      {/* 简介内容 — 淡入淡出 */}
      <div
        className="transition-opacity duration-150 ease-out"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <DescriptionContent html={activeDesc.text} />
      </div>

      {/* 制作人员折叠卡片 */}
      {creators.length > 0 && (
        <div className="mt-5">
          <CollapsibleCard
            icon={<Users className="h-4 w-4 opacity-60" />}
            label="制作人员"
            count={creators.length}
            defaultOpen={creators.length <= 5}
          >
            <CreatorsGrid creators={creators} />
          </CollapsibleCard>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   CreatorsGrid — 制作人员网格
   ═══════════════════════════════════════════════ */

function CreatorsGrid({
  creators,
}: {
  creators: { id: string; role: string; name: string; avatar?: string | null; nameJa?: string | null }[]
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {creators.map((c) => (
        <a
          key={`${c.id}-${c.role}`}
          href={`/creators/${c.id}`}
          className="flex items-center gap-2.5 rounded-xl bg-secondary/40 p-2.5 transition-all hover:bg-secondary/70"
        >
          {c.avatar ? (
            <Image
              src={c.avatar}
              alt={c.name}
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {(c.nameJa || c.name)[0]}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{c.nameJa || c.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {{ scenario: "脚本", art: "原画", chardesign: "角色设计", director: "导演", music: "音乐", songs: "主题曲" }[c.role] ?? c.role}
            </p>
          </div>
        </a>
      ))}
    </div>
  )
}


/* ═══════════════════════════════════════════════
   ArchiveCard — 游戏档案折叠卡片（手机端）
   ═══════════════════════════════════════════════ */

export function ArchiveCard({
  releaseDate,
  studioName,
  gameDuration,
  vndbId,
  gameTags,
  isOpen,
  onToggle,
}: {
  releaseDate?: string
  studioName?: string
  gameDuration?: string
  vndbId?: string
  gameTags?: { name: string; color: string; groupName?: string }[]
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="mt-3 lg:hidden">
      <CollapsibleCard
        icon={<Calendar className="h-4 w-4 opacity-60" />}
        label="游戏档案"
        isOpen={isOpen}
        onToggle={onToggle}
      >
        <div className="space-y-2.5">
          {releaseDate && (
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-xs shrink-0 text-muted-foreground">发售日期</span>
              <span className="ml-auto text-xs font-semibold text-foreground">{releaseDate}</span>
            </div>
          )}
          {studioName && (
            <div className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-xs shrink-0 text-muted-foreground">制作会社</span>
              <span className="ml-auto inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold bg-secondary text-foreground">{studioName}</span>
            </div>
          )}
          {gameDuration && (
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-xs shrink-0 text-muted-foreground">游戏时长</span>
              <span className="ml-auto inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold bg-secondary text-foreground">{gameDuration}</span>
            </div>
          )}
          {vndbId && (() => {
            const rawId = vndbId.startsWith("v") ? vndbId : `v${vndbId}`
            const numericId = rawId.replace(/^v/, "")
            return (
              <div className="flex items-center gap-2.5">
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-xs shrink-0 text-muted-foreground">VNDB</span>
                <a href={`https://vndb.org/v${numericId}`} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold transition-all hover:opacity-80 bg-secondary text-foreground">v{numericId}</a>
              </div>
            )
          })()}
          {gameTags && gameTags.length > 0 && (
            <div className="flex items-start gap-2.5">
              <Gamepad2 className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 min-w-0">
                <span className="text-xs shrink-0 text-muted-foreground">游戏标签</span>
                {gameTags.map((tag, i) => (
                  <Tag
                    key={i}
                    color={tag.color || undefined}
                    href={`/games?tag=${encodeURIComponent(tag.name)}`}
                  >
                    {tag.name}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleCard>
    </div>
  )
}


/* ═══════════════════════════════════════════════
   CollapsibleCard — 统一折叠卡片组件
   ═══════════════════════════════════════════════ */

function CollapsibleCard({
  icon,
  label,
  count,
  isOpen: controlledOpen,
  onToggle: controlledToggle,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode
  label: string
  count?: number
  isOpen?: boolean
  onToggle?: () => void
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = controlledOpen ?? internalOpen
  const toggle = controlledToggle ?? (() => setInternalOpen((v) => !v))

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center gap-2 px-4 py-3 hover:bg-secondary/30 transition-colors"
      >
        {icon}
        <span className="text-[15px] font-semibold text-foreground">{label}</span>
        {count != null && (
          <span className="text-xs font-medium text-muted-foreground">({count})</span>
        )}
        <ChevronDown
          className="ml-auto h-4 w-4 text-muted-foreground transition-transform duration-300 ease-out shrink-0"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {isOpen && (
        <div className="border-t border-border px-4 py-3 animate-fade-in-up">
          {children}
        </div>
      )}
    </div>
  )
}
