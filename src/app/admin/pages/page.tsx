import { requireAdmin } from "@/lib/admin"
import { getSiteSettings } from "@/lib/site-settings"
import { PagesManager } from "./pages-manager"
import { FileText } from "lucide-react"

export const metadata = { title: "页面管理 · 管理后台" }

export default async function AdminPagesPage() {
  await requireAdmin()
  const settings = await getSiteSettings()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">页面管理</h1>
      </div>
      <p className="text-xs text-muted-foreground">编辑 Footer 链接指向的静态页面内容。留空则使用页面默认内容。</p>
      <PagesManager initial={settings} />
    </div>
  )
}
