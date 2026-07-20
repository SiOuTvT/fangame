import { AdminCardSkeleton, AdminPageSkeleton } from "@/components/admin/admin-page-skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <AdminCardSkeleton count={5} />
      <AdminPageSkeleton rows={3} />
    </div>
  )
}
