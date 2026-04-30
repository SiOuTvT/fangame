import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const { id } = await params
  const post = await prisma.forumPost.update({ where: { id }, data: { likeCount: { increment: 1 } }, select: { likeCount: true } })
  return NextResponse.json({ likeCount: post.likeCount })
}
