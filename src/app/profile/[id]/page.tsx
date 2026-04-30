import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Calendar, Star, Heart, MessageSquare, Gamepad2, Pencil, KeyRound, Lock } from "lucide-react"
import { ProfileGameTabs } from "@/components/profile-game-tabs"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id }, select: { username: true } })
  return { title: user ? `${user.username} · 同人游戏站` : "用户主页" }
}

function calcLevel(favCount: number, playCount: number, commentCount: number) {
  const total = favCount + playCount + commentCount
  if (total >= 100) return { lv: 10, label: "传奇玩家" }
  if (total >= 60)  return { lv: 9,  label: "资深玩家" }
  if (total >= 35)  return { lv: 8,  label: "老玩家" }
  if (total >= 20)  return { lv: 7,  label: "活跃玩家" }
  if (total >= 10)  return { lv: 5,  label: "普通玩家" }
  if (total >= 3)   return { lv: 3,  label: "新手玩家" }
  return { lv: 1, label: "萌新" }
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      favorites: {
        include: {
          game: { select: { id: true, title: true, coverImage: true, isNsfw: true } },
        },
        take: 24,
      },
      playStatuses: {
        include: {
          game: { select: { id: true, title: true, coverImage: true, isNsfw: true } },
        },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { game: { select: { id: true, title: true } } },
      },
    },
  })

  if (!user) notFound()

  const userRank = await prisma.user.count({ where: { createdAt: { lte: user.createdAt } } })
  const favGames = user.favorites.map((f) => f.game)
  const { lv, label } = calcLevel(favGames.length, user.playStatuses.length, user.comments.length)
  const playStatusGames = user.playStatuses.map(p => ({ game: p.game, status: p.status }))
  const isSelf = session?.user?.id === id

  const faveGame = user.faveGameId
    ? await prisma.game.findUnique({ where: { id: user.faveGameId }, select: { id: true, title: true, coverImage: true, originalWork: true } })
    : null

  const stats = [
    { icon: Heart,        value: favGames.length,          label: "收藏" },
    { icon: Gamepad2,     value: user.playStatuses.length, label: "玩过" },
    { icon: MessageSquare,value: user.comments.length,     label: "评论" },
    { icon: Star,         value: `LV.${lv}`,               label, accent: true },
  ]

  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero */}
      <div className="relative mb-0 overflow-hidden rounded-t-2xl bg-zinc-900" style={{ minHeight: 180 }}>
        {user.banner && (
          <>
            <div className="absolute inset-0 scale-105" style={{ backgroundImage: `url(${user.banner})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(2px) brightness(0.4)" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
          </>
        )}
        <div className="relative z-10 flex items-end gap-5 p-6 pb-5">
          {/* 头像 */}
          <div className="shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-700" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-2xl font-bold text-white ring-2 ring-zinc-700">
                {user.username[0].toUpperCase()}
              </div>
            )}
          </div>
          {/* 信息 */}
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-100">{user.username}</h1>
              {isSelf && (
                <>
                  <Link href="/profile/edit" className="flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-3 py-1 text-xs text-zinc-400 ring-1 ring-white/[0.06] transition-all hover:text-zinc-200">
                    <Pencil className="h-3 w-3" strokeWidth={1.5} />编辑资料
                  </Link>
                  <Link href="/profile/edit#password" className="flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-3 py-1 text-xs text-zinc-400 ring-1 ring-white/[0.06] transition-all hover:text-zinc-200">
                    <KeyRound className="h-3 w-3" strokeWidth={1.5} />修改密码
                  </Link>
                  <Link href="/forgot-password" className="flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-3 py-1 text-xs text-zinc-400 ring-1 ring-white/[0.06] transition-all hover:text-zinc-200">
                    <Lock className="h-3 w-3" strokeWidth={1.5} />忘记密码
                  </Link>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">{user.bio || "这个人很懒，什么都没留下。"}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-600">
              <span className="flex items-center gap-1"><Star className="h-3 w-3" strokeWidth={1.5} />第 {userRank} 位成员</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" strokeWidth={1.5} />{new Date(user.createdAt).toLocaleDateString("zh-CN")} 加入</span>
            </div>
          </div>
        </div>
      </div>

      {/* 数据看板 */}
      <div className="mb-5 grid grid-cols-4 divide-x divide-white/[0.06] rounded-b-2xl bg-zinc-900 ring-1 ring-white/[0.06]">
        {stats.map(({ icon: Icon, value, label, accent }) => (
          <div key={label} className="flex flex-col items-center gap-1 py-4">
            <Icon className={cn("h-4 w-4", accent ? "text-pink-400" : "text-zinc-500")} strokeWidth={1.5} />
            <span className={cn("text-lg font-bold", accent ? "text-pink-400" : "text-zinc-100")}>{value}</span>
            <span className="text-[10px] text-zinc-600">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.6fr_1fr]">
        {/* 左：游戏 tab */}
        <div className="space-y-5">
          <ProfileGameTabs
            faveGame={faveGame ?? null}
            favGames={favGames}
            playStatusGames={playStatusGames}
          />
        </div>

        {/* 右：动态时间线 */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <span className="h-4 w-0.5 rounded-full bg-gradient-to-b from-pink-400 to-purple-400" />
            个人动态
          </h2>
          {user.comments.length === 0 ? (
            <p className="text-sm text-zinc-600">暂无动态记录</p>
          ) : (
            <div className="relative space-y-0 pl-5">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-800" />
              {user.comments.map((c) => (
                <div key={c.id} className="relative pb-4">
                  <div className="absolute -left-5 top-1 h-3.5 w-3.5 rounded-full border-2 border-zinc-700 bg-zinc-950" />
                  <p className="text-[10px] text-zinc-600 mb-0.5">{new Date(c.createdAt).toLocaleDateString("zh-CN")}</p>
                  <p className="text-xs text-zinc-500">
                    评论了{" "}
                    <Link href={`/games/${c.game.id}`} className="text-pink-400 hover:text-pink-300 transition-colors">
                      《{c.game.title}》
                    </Link>
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-zinc-600">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
