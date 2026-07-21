"use client"

import { AdminDeleteButton } from "@/components/admin-delete-button"

export function ForumDeleteBtn({ id }: { id: string }) {
  return (
    <AdminDeleteButton
      endpoint={`/api/admin/forum/${id}`}
      title="删除帖子"
      description="确定要删除这篇帖子吗？所有评论也将一并删除，删了就找不回来了。"
      successMessage="帖子已删除"
    />
  )
}
