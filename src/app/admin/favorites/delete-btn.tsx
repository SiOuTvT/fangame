"use client"

import { AdminDeleteButton } from "@/components/admin-delete-button"

export function FavoriteDeleteBtn({ id }: { id: string }) {
  return (
    <AdminDeleteButton
      endpoint="/api/admin/favorites"
      title="删除收藏"
      description="确定要删除这条收藏记录吗？删了就找不回来了。"
      successMessage="收藏已删除"
      body={{ id }}
    />
  )
}
