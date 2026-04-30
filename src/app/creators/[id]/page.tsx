import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Globe, ExternalLink } from "lucide-react"

const ROLE_LABEL: Record<string, string> = {
  scenario:   "脚本",
  art:        "原画",
  chardesign: "角色设计",
  director:   "导演",
  music:      "音乐",
  songs:      "主题曲",
  staff:      "制作人员",
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const c = await prisma.creator.findUnique({ where: { id }, select: { name: true, nameJa: true } })
  return { title: c ? `${c.nameJa || c.name} · 同人游戏站` : "创作者" }
}

export default async function CreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const creator = await prisma.creator.findUnique({
    where: { id },
    include: {
      games: {
        include: {
          game: {
            select: {
              id: true, title: true, coverImage: true,
              status: true, isNsfw: true, isPublished: true,
            },
          },
        },
      },
    },
  })

  if (!creator) notFound()

  const publishedGames = creator.games.filter(g => g.game.isPublished)
  const uniqueGames = [...new Map(publishedGames.map(g => [g.game.id, g.game])).values()]

  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero */}
      <div className="mb-6 flex items-start gap-6 rounded-2xl bg-zinc-900 p-6 ring-1 ring-white/[0.06]">
        {creator.avatar ? (
          <Image src={creator.avatar} alt={creator.name} width={96} height={96}
            className="h-24 w-24 shrink-0 rounded-full object-cover ring-2 ring-white/10" />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-3xl font-bold text-white ring-2 ring-white/10">
            {(creator.nameJa || creator.name)[0]}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2 mb-2">
            <h1 className="text-2xl font-bold text-zinc-100">{creator.nameJa || creator.name}</h1>
            {creator.nameJa && creator.name !== creator.nameJa && (
              <span className="text-sm text-zinc-500">{creator.name}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {[...new Set(publishedGames.map(g => g.role))].map(role => (
              <span key={role} className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400 ring-1 ring-white/[0.06]">
                {ROLE_LABEL[role] ?? role}
              </span>
            ))}
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-500 ring-1 ring-white/[0.06]">
              {uniqueGames.length} 部作品
            </span>
          </div>

          {creator.bio && (
            <p className="mb-3 text-sm leading-relaxed text-zinc-400 line-clamp-4">
              {creator.bio.replace(/\[url=[^\]]*\]([^[]*)\[\/url\]/g, "$1")}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {creator.vndbId && (
              <a href={`https://vndb.org/${creator.vndbId}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 ring-1 ring-white/[0.06] transition-all hover:text-zinc-200">
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />VNDB
              </a>
            )}
            {creator.twitterUrl && (
              <a href={creator.twitterUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 ring-1 ring-white/[0.06] transition-all hover:text-sky-400">
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />Twitter / X
              </a>
            )}
            {creator.wikipediaUrl && (
              <a href={creator.wikipediaUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 ring-1 ring-white/[0.06] transition-all hover:text-zinc-200">
                <Globe className="h-3 w-3" strokeWidth={1.5} />Wikipedia
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 参与作品 */}
      {uniqueGames.length > 0 ? (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <span className="h-4 w-0.5 rounded-full bg-gradient-to-b from-pink-400 to-purple-400" />
            参与作品
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {uniqueGames.map(game => {
              const roles = publishedGames
                .filter(g => g.game.id === game.id)
                .map(g => ROLE_LABEL[g.role] ?? g.role)
              return (
                <Link key={game.id} href={`/games/${game.id}`}
                  className="group overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/[0.06] transition-all hover:-translate-y-1 hover:ring-white/[0.12] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <div className="relative" style={{ aspectRatio: "4/5" }}>
                    {game.coverImage ? (
                      <Image src={game.coverImage} alt={game.title} fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                        sizes="(max-width: 640px) 33vw, 16vw" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-600 text-xs">无封面</div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 to-transparent p-2">
                      <p className="line-clamp-2 text-[10px] font-medium leading-tight text-zinc-200">{game.title}</p>
                      <p className="mt-0.5 text-[9px] text-zinc-500">{roles.join(" · ")}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ) : (
        <p className="py-12 text-center text-sm text-zinc-600">暂无关联游戏</p>
      )}
    </div>
  )
}
