import { auth } from "@/lib/auth"
import { createNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const { id } = await params
  const post = await prisma.forumPost.update({ where: { id }, data: { likeCount: { increment: 1 } }, select: { likeCount: true, userId: true } })
  
  // 创建通知
  createNotification({
    userId: post.userId,
    actorId: session.user.id,
    type: "forum_post_like",
    targetType: "forum_post",
    targetId: id,
  }).catch(() => {})

  return NextResponse.json({ likeCount: post.likeCount })
}
