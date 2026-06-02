import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const { id } = await params

  // 检查是否已点赞
  const existing = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId: session.user.id, commentId: id } },
  })

  if (existing) {
    // 取消点赞
    await prisma.commentLike.delete({ where: { id: existing.id } })
    const comment = await prisma.comment.update({
      where: { id },
      data: { likeCount: { decrement: 1 } },
      select: { likeCount: true },
    })
    return NextResponse.json({ count: comment.likeCount, liked: false })
  }

  // 点赞
  await prisma.commentLike.create({
    data: { userId: session.user.id, commentId: id },
  })
  const comment = await prisma.comment.update({
    where: { id },
    data: { likeCount: { increment: 1 } },
    select: { likeCount: true },
  })

  return NextResponse.json({ count: comment.likeCount, liked: true })
}
