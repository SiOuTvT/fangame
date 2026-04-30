import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const { id: postId } = await params

  const fd = await req.formData()
  const content = (fd.get("content") as string)?.trim()
  if (!content) return NextResponse.json({ error: "内容不能为空" }, { status: 400 })

  const comment = await prisma.forumComment.create({
    data: { postId, userId: session.user.id, content },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  })

  return NextResponse.json({ ...comment, createdAt: comment.createdAt.toISOString() }, { status: 201 })
}
