"use client"

import { AdminDeleteButton } from "@/components/admin-delete-button"

export function CheckinDeleteBtn({ id }: { id: string }) {
  return (
    <AdminDeleteButton
      endpoint="/api/admin/checkins"
      title="删除签到记录"
      description="确定要删除这条签到记录吗？删了就找不回来了。"
      successMessage="签到记录已删除"
      body={{ id }}
    />
  )
}
