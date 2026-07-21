"use client"

import { AdminDeleteButton } from "@/components/admin-delete-button"

export function ReportDeleteBtn({ id }: { id: string }) {
  return (
    <AdminDeleteButton
      endpoint="/api/admin/reports"
      title="删除举报"
      description="确定要删除这条举报记录吗？删了就找不回来了。"
      successMessage="举报已删除"
      body={{ id }}
    />
  )
}
