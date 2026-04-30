import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { MusicManager } from "@/components/music-manager"

export const metadata = { title: "音乐管理 · 管理后台" }

export default async function AdminMusicPage() {
  await requireAdmin()
  const music = await prisma.music.findMany({ orderBy: { createdAt: "desc" } })
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-lg font-bold text-zinc-100">音乐管理</h1>
      <MusicManager initialMusic={music} />
    </div>
  )
}
