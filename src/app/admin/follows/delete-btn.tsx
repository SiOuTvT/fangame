"use client"

import { AdminDeleteButton } from "@/components/admin-delete-button"

export function FollowDeleteBtn({ id }: { id: string }) {
  return (
    <AdminDeleteButton
      endpoint="/api/admin/follows"
      title="删除关注关系"
      description="确定要删除这条关注关系吗？删了就找不回来了。"
      successMessage="关注关系已删除"
      body={{ id }}
    />
  )
}
