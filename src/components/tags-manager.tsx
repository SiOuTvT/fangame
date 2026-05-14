"use client"

import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface Tag { id: string; name: string; color: string; gameCount: number }

const PRESET_COLORS = [
  "#a78bfa", "#818cf8", "#60a5fa", "#38bdf8", "#22d3ee",
  "#34d399", "#4ade80", "#facc15", "#fb923c", "#f87171",
  "#e879f9", "#f472b6",
]

export function TagsManager({ initialTags }: { initialTags: Tag[] }) {
  const [tags, setTags] = useState(initialTags)
  const [name, setName] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "创建失败"); setSaving(false); return }
      setTags(prev => [...prev, { ...data, gameCount: 0 }].sort((a, b) => a.name.localeCompare(b.name)))
      setName("")
    } catch { setError("网络错误") }
    setSaving(false)
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), color: editColor }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "更新失败"); setSaving(false); return }
      setTags(prev => prev.map(t => t.id === id ? { ...t, name: data.name, color: data.color } : t))
      setEditing(null)
    } catch { setError("网络错误") }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除此标签？")) return
    const res = await fetch(`/api/admin/tags/${id}`, { method: "DELETE" })
    if (res.ok) setTags(prev => prev.filter(t => t.id !== id))
  }

  const inputCls = "w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 ring-1 ring-border outline-none focus:ring-ring transition-all"

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">{error}</div>
      )}

      {/* 新建标签 */}
      <form onSubmit={handleCreate} className="rounded-xl bg-card p-5 ring-1 ring-border space-y-3">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="新标签名称"
            className={inputCls}
          />
          <button type="submit" disabled={saving || !name.trim()}
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-primary/10 text-primary px-4 py-2.5 text-xs font-semibold ring-1 ring-primary/20 hover:bg-primary/20 transition-all disabled:opacity-50">
            <Plus className="h-4 w-4" strokeWidth={2} />添加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full transition-all ${color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-110"}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </form>

      {/* 标签列表 */}
      <div className="rounded-xl bg-card ring-1 ring-border divide-y divide-border overflow-hidden">
        {tags.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">暂无标签</p>
        )}
        {tags.map(tag => (
          <div key={tag.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/50">
            {editing === tag.id ? (
              <>
                <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: editColor }} />
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="flex-1 rounded-lg bg-secondary px-3 py-1.5 text-sm text-foreground ring-1 ring-border outline-none focus:ring-ring" />
                <div className="flex gap-1.5">
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setEditColor(c)}
                      className={`h-5 w-5 rounded-full transition-all ${editColor === c ? "ring-2 ring-primary" : ""}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <button onClick={() => handleUpdate(tag.id)} disabled={saving}
                  className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50">
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "保存"}
                </button>
                <button onClick={() => setEditing(null)}
                  className="shrink-0 rounded-lg bg-secondary px-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: tag.color }} />
                <span className="flex-1 text-sm font-medium text-foreground">{tag.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{tag.gameCount} 个游戏</span>
                <button onClick={() => { setEditing(tag.id); setEditName(tag.name); setEditColor(tag.color) }}
                  className="shrink-0 rounded-lg bg-secondary p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(tag.id)}
                  className="shrink-0 rounded-lg bg-secondary p-1.5 text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}