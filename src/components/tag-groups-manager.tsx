"use client"

import { TAG_POSITIONS, getPositionsByGroup } from "@/lib/tag-positions"
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "./ui/confirm-dialog"

interface TagInGroup {
  id: string
  name: string
  color: string
  gameCount: number
}

export interface TagGroup {
  id: string
  name: string
  description: string
  color: string
  positions: string[]
  isPreset?: boolean
  tags: TagInGroup[]
}

const PRESET_COLORS = [
  "#7c8a9e", "#6b7280", "#9ca3af",
  "#a78bfa", "#818cf8", "#60a5fa", "#38bdf8", "#22d3ee",
  "#34d399", "#4ade80", "#facc15", "#fb923c", "#f87171",
  "#e879f9", "#f472b6",
]

const POSITION_GROUPS = getPositionsByGroup()

function PositionCheckboxGroup({
  selected,
  onChange,
  disabled,
}: {
  selected: string[]
  onChange: (positions: string[]) => void
  disabled?: boolean
}) {
  function toggle(key: string) {
    if (disabled) return
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key]
    )
  }

  return (
    <div className="space-y-3">
      {Object.entries(POSITION_GROUPS).map(([groupName, positions]) => (
        <div key={groupName}>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{groupName}</p>
          <div className="flex flex-wrap gap-1.5">
            {positions.map((pos) => {
              const checked = selected.includes(pos.key)
              return (
                <button
                  key={pos.key}
                  type="button"
                  onClick={() => toggle(pos.key)}
                  disabled={disabled}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition-all ${
                    checked
                      ? "bg-violet-500/15 text-violet-400 ring-violet-500/30"
                      : "bg-secondary text-muted-foreground ring-border hover:bg-accent hover:text-foreground"
                  } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  title={pos.description}
                >
                  <span>{pos.icon}</span>
                  <span>{pos.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TagGroupsManager({ initialGroups }: { initialGroups: TagGroup[] }) {
  const [groups, setGroups] = useState(initialGroups)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [positions, setPositions] = useState<string[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editColor, setEditColor] = useState("")
  const [editPositions, setEditPositions] = useState<string[]>([])
  const [editIsPreset, setEditIsPreset] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string
    name: string
    tagCount?: number
    forceEndpoint?: boolean
  } | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/tag-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description, color, positions }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "创建失败")
        setSaving(false)
        return
      }
      setGroups((prev) =>
        [...prev, { ...data, tags: [] }].sort((a, b) => {
          // 预设组排前面
          if (a.isPreset && !b.isPreset) return -1
          if (!a.isPreset && b.isPreset) return 1
          return a.name.localeCompare(b.name)
        })
      )
      setName("")
      setDescription("")
      setPositions([])
      setShowCreateForm(false)
      toast.success("标签组创建成功")
    } catch {
      setError("网络错误")
    }
    setSaving(false)
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/tag-groups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDesc,
          color: editColor,
          positions: editPositions,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "更新失败")
        setSaving(false)
        return
      }
      setGroups((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                name: data.name,
                description: data.description,
                color: data.color,
                positions: data.positions,
              }
            : g
        )
      )
      setEditing(null)
      toast.success("已保存")
    } catch {
      setError("网络错误")
    }
    setSaving(false)
  }

  async function handleDelete(id: string, forceDelete = false) {
    const method = forceDelete ? "PATCH" : "DELETE"
    const body = forceDelete ? JSON.stringify({ forceDelete: true }) : undefined
    const res = await fetch(`/api/admin/tag-groups/${id}`, {
      method,
      headers: forceDelete ? { "Content-Type": "application/json" } : undefined,
      body,
    })
    const data = await res.json()
    if (res.ok) {
      setGroups((prev) => prev.filter((g) => g.id !== id))
      toast.success("已删除")
    } else if (data.confirm) {
      setDeleteConfirm({
        id,
        name: data.error,
        tagCount: data.tagCount,
        forceEndpoint: true,
      })
    } else {
      toast.error(data.error || "删除失败")
    }
  }

  function startEdit(group: TagGroup) {
    setEditing(group.id)
    setEditName(group.name)
    setEditDesc(group.description)
    setEditColor(group.color)
    setEditPositions(group.positions || [])
    setEditIsPreset(group.isPreset || false)
  }

  const inputCls =
    "w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 ring-1 ring-border outline-none focus:ring-ring transition-all"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
          标签组管理
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1.5 rounded-xl bg-violet-500/10 text-violet-400 px-3.5 py-2 text-xs font-semibold ring-1 ring-violet-500/20 hover:bg-violet-500/20 transition-all"
        >
          {showCreateForm ? (
            <>
              <X className="h-3.5 w-3.5" /> 收起
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> 新建标签组
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
          {error}
        </div>
      )}

      {/* 新建标签组 */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl bg-card p-5 ring-1 ring-border space-y-4"
        >
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="标签组名称（如：题材、风格、制作商）"
              className={inputCls}
            />
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述（可选）"
            className={inputCls}
          />

          {/* 色盘 */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">标签组颜色</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-all ${
                    color === c
                      ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-background scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* 方位选择 */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              绑定展示方位
              <span className="ml-1 text-muted-foreground/60">（选择该标签组在前台哪些位置展示）</span>
            </p>
            <PositionCheckboxGroup selected={positions} onChange={setPositions} />
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-violet-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-violet-600 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            创建标签组
          </button>
        </form>
      )}

      {/* 标签组列表 */}
      <div className="rounded-xl bg-card ring-1 ring-border divide-y divide-border overflow-hidden">
        {groups.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            暂无标签组，点击上方「新建标签组」开始创建
          </p>
        )}
        {groups.map((group) => (
          <div key={group.id}>
            <div className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/50">
              {editing === group.id ? (
                /* ── 编辑模式 ── */
                <div className="flex-1 space-y-3 py-1">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: editColor }} />
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="标签组名称"
                      className="flex-1 rounded-lg bg-secondary px-3 py-1.5 text-sm text-foreground ring-1 ring-border outline-none focus:ring-ring"
                    />
                    <input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="描述"
                      className="w-40 rounded-lg bg-secondary px-3 py-1.5 text-sm text-foreground ring-1 ring-border outline-none focus:ring-ring"
                    />
                  </div>

                  {/* 色盘 */}
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        className={`h-5 w-5 rounded-full transition-all ${
                          editColor === c ? "ring-2 ring-violet-500 scale-110" : "hover:scale-110"
                        }`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>

                  {/* 方位选择 */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">绑定展示方位</p>
                    <PositionCheckboxGroup
                      selected={editPositions}
                      onChange={setEditPositions}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdate(group.id)}
                      disabled={saving}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      保存
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      取消
                    </button>
                    {editIsPreset && (
                      <span className="ml-auto text-[11px] text-amber-400/70 bg-amber-500/10 rounded-full px-2.5 py-0.5 ring-1 ring-amber-500/20">
                        🔒 系统内置组
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* ── 展示模式 ── */
                <>
                  <button
                    onClick={() => setExpanded(expanded === group.id ? null : group.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: group.color }}
                    />
                    <span className="text-sm font-semibold text-foreground">{group.name}</span>
                    {group.isPreset && (
                      <span className="shrink-0 text-[10px] text-amber-400/80 bg-amber-500/10 rounded-full px-1.5 py-0.5 ring-1 ring-amber-500/20">
                        内置
                      </span>
                    )}
                    {group.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        {group.description}
                      </span>
                    )}
                    {group.positions && group.positions.length > 0 && (
                      <span className="shrink-0 text-[10px] text-violet-400/70 bg-violet-500/10 rounded-full px-1.5 py-0.5">
                        {group.positions.length} 个方位
                      </span>
                    )}
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {group.tags.length} 个标签
                    </span>
                  </button>
                  <button
                    onClick={() => startEdit(group)}
                    title="编辑标签组"
                    aria-label="编辑标签组"
                    className="shrink-0 rounded-lg bg-secondary p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {!group.isPreset && (
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          id: group.id,
                          name: group.name,
                          tagCount: group.tags.length,
                        })
                      }
                      title="删除标签组"
                      aria-label="删除标签组"
                      className="shrink-0 rounded-lg bg-secondary p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* 展开显示组内标签 + 绑定方位 */}
            {expanded === group.id && (
              <div className="px-5 pb-3 pl-10 space-y-2">
                {/* 绑定方位 */}
                {group.positions && group.positions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {group.positions.map((posKey) => {
                      const def = TAG_POSITIONS.find((p) => p.key === posKey)
                      if (!def) return null
                      return (
                        <span
                          key={posKey}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-secondary text-muted-foreground ring-1 ring-border"
                        >
                          {def.icon} {def.label}
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* 组内标签 */}
                {group.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {group.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1"
                        style={{
                          background: tag.color + "18",
                          color: tag.color,
                          borderColor: tag.color + "30",
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: tag.color }}
                        />
                        {tag.name}
                        <span className="text-[10px] opacity-60">{tag.gameCount}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/60 italic">该标签组暂无标签</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(v) => {
          if (!v) setDeleteConfirm(null)
        }}
        onConfirm={() => {
          if (deleteConfirm) {
            if (deleteConfirm.forceEndpoint) {
              handleDelete(deleteConfirm.id, true)
            } else {
              handleDelete(deleteConfirm.id)
            }
          }
          setDeleteConfirm(null)
        }}
        title="删除标签组"
        description={
          deleteConfirm?.tagCount && deleteConfirm.tagCount > 0
            ? `标签组「${deleteConfirm.name}」包含 ${deleteConfirm.tagCount} 个标签，删除后这些标签将变为未分组状态。`
            : `确定删除标签组「${deleteConfirm?.name}」？`
        }
        confirmText="删除"
        variant="destructive"
      />
    </div>
  )
}