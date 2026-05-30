import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"

/**
 * 旧路由兼容重定向：
 *   /profile/[cuid] → /user/[serialId]
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id }, select: { username: true } })
  return { title: user ? `${user.username} · 同人游戏站` : "用户主页" }
}

export default async function ProfileRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 这个路由只处理 cuid 格式（由 middleware 拦截数字格式后调转到 /user/[id]）
  const user = await prisma.user.findUnique({
    where: { id },
    select: { serialId: true },
  })

  if (!user) notFound()

  // 308 永久重定向到新的 /user/[serialId] 路由
  redirect(`/user/${user.serialId}`)
}
