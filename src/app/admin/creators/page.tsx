import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { CreatorsManager } from "@/components/creators-manager"

export const metadata = { title: "创作者管理 · 管理后台" }

export default async function AdminCreatorsPage() {
  await requireAdmin()
  const creators = await prisma.creator.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { games: true } } },
  })
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-zinc-100">创作者管理</h1>
      <CreatorsManager initialCreators={creators} />
    </div>
  )
}
