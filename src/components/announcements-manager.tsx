"use client"

import { useState } from "react"
import { Plus, Trash2, Loader2, Eye, EyeOff } from "lucide-react"

interface Ann { id: string; title: string; content: string; link: string; isActive: boolean; createdAt: string }

export function AnnouncementsManager({ initialAnns }: { initialAnns: Ann[] }) {
  const [anns, setAnns] = useState(initialAnns)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [link, setLink] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")

  const inputCls = "w-full rounded-xl bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 ring-1 ring-white/[0.06] outline-none focus:ring-zinc-600 transition-all"

  async function addAnn(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setAdding(true)
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content.trim(), link: link.trim() }),
    })
    const data = await res.json()
    setAdding(false)
    if (!res.ok) { setError(data.error); return }
    setAnns((prev) => [{ ...data, createdAt: data.createdAt }, ...prev])
    setTitle(""); setContent(""); setLink("")
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    })
    if (res.ok) setAnns((prev) => prev.map((a) => a.id === id ? { ...a, isActive: !current } : a))
  }

  async function deleteAnn(id: string) {
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" })
    setAnns((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* 新增表单 */}
      <div className="rounded-xl bg-zinc-900 p-5 ring-1 ring-white/[0.06]">
        <h2 className="mb-4 text-sm font-semibold text-zinc-300">发布公告</h2>
        {error && <p className="mb-3 text-xs text-red-400">{error}</p>}
        <form onSubmit={addAnn} className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="公告标题 *" required className={inputCls} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="公告内容 *" rows={4} required className={`${inputCls} resize-none`} />
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="跳转链接（选填）" className={inputCls} />
          <button type="submit" disabled={adding}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-4 py-2 text-sm text-zinc-300 ring-1 ring-white/[0.06] transition-all hover:bg-zinc-700 hover:text-white disabled:opacity-60">
            {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} /> : <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />}
            {adding ? "发布中…" : "发布公告"}
          </button>
        </form>
      </div>

      {/* 公告列表 */}
      <div className="rounded-xl bg-zinc-900 ring-1 ring-white/[0.06] overflow-hidden">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <p className="text-xs text-zinc-500">共 {anns.length} 条公告</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {anns.length === 0 && <p className="px-4 py-8 text-center text-sm text-zinc-600">暂无公告</p>}
          {anns.map((ann) => (
            <div key={ann.id} className="px-4 py-3 hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${ann.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                      {ann.isActive ? "展示中" : "已隐藏"}
                    </span>
                    <span className="text-xs font-medium text-zinc-300 truncate">{ann.title}</span>
                  </div>
                  <p className="text-xs text-zinc-600 line-clamp-2">{ann.content}</p>
                  <p className="mt-1 text-[10px] text-zinc-700">{new Date(ann.createdAt).toLocaleDateString("zh-CN")}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button onClick={() => toggleActive(ann.id, ann.isActive)}
                    className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-300">
                    {ann.isActive ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  </button>
                  <button onClick={() => deleteAnn(ann.id)}
                    className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
