"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"

export function AdminGameDeleteBtn({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await fetch(`/api/admin/games/${id}`, { method: "DELETE" })
    setLoading(false)
    setConfirming(false)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-zinc-400">确认删除？</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400 ring-1 ring-red-500/20 transition-all hover:bg-red-500/20"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} /> : "确认"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-500 ring-1 ring-white/[0.06] hover:text-zinc-300"
        >
          取消
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`删除 ${title}`}
      className="flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-500 ring-1 ring-white/[0.06] transition-all hover:bg-red-500/10 hover:text-red-400"
    >
      <Trash2 className="h-3 w-3" strokeWidth={1.5} />
    </button>
  )
}
