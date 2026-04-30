import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const { id: gameId } = await params

  const content = (await req.formData()).get("content") as string
  if (!content?.trim()) return NextResponse.json({ error: "内容不能为空" }, { status: 400 })

  const comment = await prisma.comment.create({
    data: { gameId, userId: session.user.id, content: content.trim() },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  })

  return NextResponse.json({ ...comment, createdAt: comment.createdAt.toISOString() }, { status: 201 })
}
