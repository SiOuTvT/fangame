import { requireAdmin } from "@/lib/admin"
import { AdminNav } from "@/components/admin-nav"

export const metadata = { title: "管理后台 · 同人游戏站" }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-zinc-950">
      <AdminNav />
      <div className="mx-auto max-w-6xl px-5 py-6">
        {children}
      </div>
    </div>
  )
}
