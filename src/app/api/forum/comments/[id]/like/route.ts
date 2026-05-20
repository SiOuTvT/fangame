import { auth } from "@/lib/auth"
import { createNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const { id } = await params
  const c = await prisma.forumComment.update({ where: { id }, data: { likeCount: { increment: 1 } }, select: { likeCount: true, userId: true, postId: true } })
  
  // 创建通知
  createNotification({
    userId: c.userId,
    actorId: session.user.id,
    type: "forum_comment_like",
    targetType: "forum_comment",
    targetId: id,
  }).catch(() => {})

  return NextResponse.json({ likeCount: c.likeCount })
}
