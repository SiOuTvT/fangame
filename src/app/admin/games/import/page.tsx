import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { VndbImporter } from "@/components/vndb-importer"

export const metadata = { title: "从 VNDB 导入 · 管理后台" }

export default async function ImportGamePage() {
  await requireAdmin()
  const [tags, creators] = await Promise.all([
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.creator.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, nameJa: true, vndbId: true },
    }),
  ])
  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-lg font-bold text-zinc-100">从 VNDB 导入游戏</h1>
        <p className="mt-1 text-xs text-zinc-500">
          输入 VNDB VN ID（如 v1234），自动拉取标题/封面/简介/创作者。
          <span className="text-amber-400"> 仅允许导入同人作品（个人/同人社团），商业游戏会被拒绝。</span>
        </p>
      </div>
      <VndbImporter existingTags={tags} existingCreators={creators} />
    </div>
  )
}
