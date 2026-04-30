import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Gamepad2, Tag, Users, Eye, Plus } from "lucide-react"
import { AdminCharts } from "@/components/admin-charts"

function getLast14Days() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return d.toISOString().slice(0, 10)
  })
}

export default async function AdminDashboard() {
  await requireAdmin()

  const days = getLast14Days()
  const since = new Date(days[0])

  const [totalGames, published, totalTags, totalUsers, recentGames, topGames,
    newGames, newUsers, newComments] = await Promise.all([
    prisma.game.count(),
    prisma.game.count({ where: { isPublished: true } }),
    prisma.tag.count(),
    prisma.user.count(),
    prisma.game.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, isPublished: true, createdAt: true } }),
    prisma.game.findMany({ where: { isPublished: true }, orderBy: { viewCount: "desc" }, take: 5, select: { id: true, title: true, viewCount: true } }),
    prisma.game.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.comment.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ])

  function toChartData(items: { createdAt: Date }[]) {
    const map = new Map(days.map(d => [d, 0]))
    for (const item of items) {
      const key = item.createdAt.toISOString().slice(0, 10)
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1)
    }
    return days.map(d => ({ date: d.slice(5), value: map.get(d) ?? 0 }))
  }

  const stats = [
    { icon: Gamepad2, label: "游戏总数", value: totalGames, sub: `${published} 已发布`, href: "/admin/games" },
    { icon: Tag,      label: "标签数",   value: totalTags,  sub: "点击管理",           href: "/admin/tags" },
    { icon: Users,    label: "注册用户", value: totalUsers, sub: "累计注册",           href: "/admin/users" },
    { icon: Eye,      label: "未发布",   value: totalGames - published, sub: "待审核", href: "/admin/games" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-100">仪表盘</h1>
        <Link href="/admin/games/new" className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 ring-1 ring-white/[0.06] transition-all hover:bg-zinc-700 hover:text-white">
          <Plus className="h-4 w-4" strokeWidth={1.5} />新增游戏
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, sub, href }) => (
          <Link key={label} href={href} className="rounded-xl bg-zinc-900 p-4 ring-1 ring-white/[0.06] transition-all hover:bg-zinc-800 hover:ring-white/10">
            <Icon className="mb-2 h-4 w-4 text-zinc-500" strokeWidth={1.5} />
            <p className="text-2xl font-bold text-zinc-100">{value}</p>
            <p className="text-xs font-medium text-zinc-400">{label}</p>
            <p className="mt-0.5 text-[10px] text-zinc-600">{sub}</p>
          </Link>
        ))}
      </div>

      {/* 趋势图表（最近14天） */}
      <div>
        <p className="mb-3 text-xs font-medium text-zinc-500">最近 14 天趋势</p>
        <AdminCharts
          gamesByDay={toChartData(newGames)}
          usersByDay={toChartData(newUsers)}
          commentsByDay={toChartData(newComments)}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* 最近添加 */}
        <div className="rounded-xl bg-zinc-900 p-4 ring-1 ring-white/[0.06]">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">最近添加</h2>
          <div className="space-y-2">
            {recentGames.map(g => (
              <div key={g.id} className="flex items-center justify-between">
                <Link href={`/admin/games/${g.id}`} className="truncate text-sm text-zinc-400 hover:text-zinc-200 transition-colors">{g.title}</Link>
                <span className={`ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] ${g.isPublished ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                  {g.isPublished ? "已发布" : "草稿"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 热门游戏 */}
        <div className="rounded-xl bg-zinc-900 p-4 ring-1 ring-white/[0.06]">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">浏览最多</h2>
          <div className="space-y-2">
            {topGames.map((g, i) => (
              <div key={g.id} className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-xs text-zinc-600">{i + 1}</span>
                <Link href={`/games/${g.id}`} className="flex-1 truncate text-sm text-zinc-400 hover:text-zinc-200 transition-colors">{g.title}</Link>
                <span className="shrink-0 text-xs text-zinc-600">{g.viewCount} 次</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
