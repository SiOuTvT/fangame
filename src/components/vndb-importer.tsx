"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Search, Download, Loader2, CheckCircle2, XCircle,
  AlertTriangle, Plus, Tag, Users
} from "lucide-react"

interface ExistingTag     { id: string; name: string; color: string }
interface ExistingCreator { id: string; name: string; nameJa: string; vndbId: string }

interface VndbResult {
  vndbId: string; title: string; titleEn: string
  description: string; coverImage: string; isNsfw: boolean
  released: string; developers: string[]
  tags: { name: string; vndbId: string }[]
  staff: { id: string; name: string; roles: string[] }[]
}

interface Props {
  existingTags:     ExistingTag[]
  existingCreators: ExistingCreator[]
}

const ROLE_LABEL: Record<string, string> = {
  scenario: "脚本", art: "原画", chardesign: "角色设计",
  director: "导演", music: "音乐", songs: "主题曲",
}

export function VndbImporter({ existingTags, existingCreators }: Props) {
  const router = useRouter()
  const [input, setInput]       = useState("")
  const [fetching, setFetching] = useState(false)
  const [result, setResult]     = useState<VndbResult | null>(null)
  const [error, setError]       = useState("")
  const [isCommercial, setIsCommercial] = useState(false)

  // 用户可调整的字段
  const [title, setTitle]           = useState("")
  const [originalWork, setOriginalWork] = useState("")
  const [description, setDescription]   = useState("")
  const [isNsfw, setIsNsfw]         = useState(false)
  const [isPublished, setIsPublished] = useState(true)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [selectedCreators, setSelectedCreators] = useState<{ creatorId: string; role: string }[]>([])
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  async function fetchVndb() {
    const id = input.trim()
    if (!id) return
    setFetching(true); setError(""); setResult(null); setIsCommercial(false)

    const res  = await fetch(`/api/admin/games/vndb?id=${id}`)
    const data = await res.json()
    setFetching(false)

    if (!res.ok) {
      setError(data.error)
      setIsCommercial(!!data.isCommercial)
      return
    }

    setResult(data)
    setTitle(data.title)
    setDescription(data.description)
    setIsNsfw(data.isNsfw)

    // 自动匹配已有标签（名字包含关系）
    const matchedTagIds = existingTags
      .filter(t => data.tags.some((vt: { name: string }) =>
        t.name.toLowerCase().includes(vt.name.toLowerCase()) ||
        vt.name.toLowerCase().includes(t.name.toLowerCase())
      ))
      .map(t => t.id)
    setSelectedTagIds(matchedTagIds)

    // 自动匹配已有创作者（通过 vndbId）
    const matchedCreators: { creatorId: string; role: string }[] = []
    for (const s of data.staff) {
      const found = existingCreators.find(c => c.vndbId === s.id)
      if (found) {
        for (const role of s.roles) {
          matchedCreators.push({ creatorId: found.id, role })
        }
      }
    }
    setSelectedCreators(matchedCreators)
  }

  async function handleImport() {
    if (!result) return
    setSaving(true)

    const body = {
      title: title.trim(),
      originalWork: originalWork.trim(),
      description: description.trim(),
      coverImage: result.coverImage,
      screenshots: [],
      downloadLinks: [],
      status: "完结",
      isNsfw,
      vndbId: result.vndbId.replace("v", ""),
      isPublished,
      tagIds: selectedTagIds,
      gameCreators: selectedCreators.filter(c => c.creatorId && c.role),
    }

    const res = await fetch("/api/admin/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setSaving(false)

    if (res.ok) {
      setSaved(true)
      setTimeout(() => router.push("/admin/games"), 1500)
    } else {
      const d = await res.json()
      setError(d.error ?? "导入失败")
    }
  }

  const inputCls = "w-full rounded-xl bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 ring-1 ring-white/[0.06] outline-none focus:ring-zinc-600 transition-all"

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" strokeWidth={1.5} />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchVndb()}
            placeholder="输入 VNDB VN ID，如 v1234 或 1234"
            className={`${inputCls} pl-9`}
          />
        </div>
        <button onClick={fetchVndb} disabled={fetching || !input.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-700 px-4 py-2 text-sm text-zinc-200 transition-all hover:bg-zinc-600 disabled:opacity-50">
          {fetching ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Download className="h-4 w-4" strokeWidth={1.5} />}
          {fetching ? "拉取中…" : "拉取"}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className={`flex items-start gap-2.5 rounded-xl p-4 text-sm ring-1 ${isCommercial ? "bg-amber-500/10 text-amber-400 ring-amber-500/20" : "bg-red-500/10 text-red-400 ring-red-500/20"}`}>
          {isCommercial ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} /> : <XCircle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} />}
          <p>{error}</p>
        </div>
      )}

      {/* 成功提示 */}
      {saved && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-400 ring-1 ring-emerald-500/20">
          <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
          导入成功！正在跳转…
        </div>
      )}

      {/* 预览 + 编辑 */}
      {result && !saved && (
        <div className="space-y-4">
          {/* 基本信息预览 */}
          <div className="rounded-xl bg-zinc-900 p-5 ring-1 ring-white/[0.06]">
            <div className="flex gap-4 mb-4">
              {result.coverImage && (
                <div className="relative h-32 w-[102px] shrink-0 overflow-hidden rounded-xl">
                  <Image src={result.coverImage} alt={result.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs text-zinc-500">VNDB: {result.vndbId} · 发售: {result.released}</p>
                <p className="text-xs text-zinc-500">开发者: {result.developers.join(", ")}</p>
                {result.isNsfw && (
                  <span className="inline-block rounded bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400 ring-1 ring-red-500/20">NSFW</span>
                )}
                <p className="text-xs text-zinc-400 line-clamp-3 mt-1">{result.description.slice(0, 120)}…</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">游戏标题 *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
                {result.titleEn !== result.title && (
                  <p className="mt-1 text-[10px] text-zinc-600">英文标题: {result.titleEn}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">原作（如：东方Project）</label>
                <input value={originalWork} onChange={e => setOriginalWork(e.target.value)} placeholder="留空则为原创" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">简介</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={`${inputCls} resize-none`} />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
                  <input type="checkbox" checked={isNsfw} onChange={e => setIsNsfw(e.target.checked)} className="h-4 w-4 rounded accent-pink-500" />
                  NSFW 内容
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
                  <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="h-4 w-4 rounded accent-pink-500" />
                  立即发布
                </label>
              </div>
            </div>
          </div>

          {/* 标签匹配 */}
          <div className="rounded-xl bg-zinc-900 p-5 ring-1 ring-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-zinc-300">标签</h3>
            </div>

            {/* VNDB 原始标签 */}
            <div className="mb-3">
              <p className="mb-1.5 text-[10px] text-zinc-600">VNDB 标签（仅供参考）</p>
              <div className="flex flex-wrap gap-1">
                {result.tags.map(t => (
                  <span key={t.vndbId} className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">{t.name}</span>
                ))}
              </div>
            </div>

            {/* 站内标签选择 */}
            <div>
              <p className="mb-1.5 text-[10px] text-zinc-600">关联站内标签（已自动匹配，可调整）</p>
              <div className="flex flex-wrap gap-1.5">
                {existingTags.map(tag => (
                  <button key={tag.id} type="button"
                    onClick={() => setSelectedTagIds(p => p.includes(tag.id) ? p.filter(id => id !== tag.id) : [...p, tag.id])}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 transition-all ${selectedTagIds.includes(tag.id) ? "opacity-100" : "opacity-30 hover:opacity-60"}`}
                    style={{ color: tag.color, background: `${tag.color}18`, outlineColor: tag.color }}>
                    {tag.name}
                  </button>
                ))}
                {existingTags.length === 0 && <p className="text-xs text-zinc-600">暂无站内标签</p>}
              </div>
            </div>
          </div>

          {/* 创作者匹配 */}
          <div className="rounded-xl bg-zinc-900 p-5 ring-1 ring-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-zinc-300">创作者</h3>
            </div>

            {/* VNDB Staff */}
            <div className="mb-3">
              <p className="mb-1.5 text-[10px] text-zinc-600">VNDB Staff</p>
              <div className="space-y-1">
                {result.staff.map(s => {
                  const matched = existingCreators.find(c => c.vndbId === s.id)
                  return (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <span className={matched ? "text-emerald-400" : "text-zinc-500"}>
                        {matched ? "✓" : "○"}
                      </span>
                      <span className="text-zinc-300">{s.name}</span>
                      <span className="text-zinc-600">{s.roles.map(r => ROLE_LABEL[r] ?? r).join(" / ")}</span>
                      {!matched && (
                        <span className="text-[10px] text-zinc-700">（未在站内，可先去创作者管理添加）</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 已匹配的创作者关联 */}
            {selectedCreators.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] text-zinc-600">将关联以下创作者</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCreators.map((sc, i) => {
                    const c = existingCreators.find(x => x.id === sc.creatorId)
                    return (
                      <span key={i} className="flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300 ring-1 ring-white/[0.06]">
                        {c?.nameJa || c?.name}
                        <span className="text-zinc-600">· {ROLE_LABEL[sc.role] ?? sc.role}</span>
                        <button onClick={() => setSelectedCreators(p => p.filter((_, idx) => idx !== i))}
                          className="ml-0.5 text-zinc-600 hover:text-red-400">×</button>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedCreators.length === 0 && (
              <p className="text-xs text-zinc-600">
                没有匹配到站内创作者。可先在
                <a href="/admin/creators" target="_blank" className="text-pink-400 hover:text-pink-300 mx-1">创作者管理</a>
                添加后重新导入。
              </p>
            )}
          </div>

          {/* 导入按钮 */}
          <div className="flex gap-3">
            <button onClick={handleImport} disabled={saving || !title.trim()}
              className="gradient-accent flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Plus className="h-4 w-4" strokeWidth={1.5} />}
              {saving ? "导入中…" : "确认导入"}
            </button>
            <button onClick={() => { setResult(null); setError("") }}
              className="rounded-xl bg-zinc-800 px-6 py-2.5 text-sm text-zinc-400 ring-1 ring-white/[0.06] hover:text-zinc-200">
              重新搜索
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
