"use client"

import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function CreatorDeleteBtn({ id }: { id: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleDelete() {
    const res = await fetch(`/api/admin/creators/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("创作者已删除")
      router.refresh()
    } else {
      toast.error("删除失败")
      throw new Error("删除失败")
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="删除创作者"
        className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-xs text-muted-foreground ring-1 ring-border transition-all hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 className="h-3 w-3" strokeWidth={1.5} />
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="删除创作者"
        description="确定要删除该创作者吗？相关游戏不会被删除，但创作者信息将被移除。删了就找不回来了。"
        confirmText="删除"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}