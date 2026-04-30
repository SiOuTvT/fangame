import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const posts = await prisma.forumPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { comments: true } },
    },
  })
  return NextResponse.json(
    posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      imageUrl: p.imageUrl,
      likeCount: p.likeCount,
      isSolved: p.isSolved,
      createdAt: p.createdAt.toISOString(),
      user: p.user,
      commentCount: p._count.comments,
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const fd = await req.formData()
  const title = (fd.get("title") as string)?.trim()
  const content = (fd.get("content") as string)?.trim()
  if (!title || !content) return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 })

  const post = await prisma.forumPost.create({
    data: { userId: session.user.id, title, content },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { comments: true } },
    },
  })

  return NextResponse.json({
    id: post.id, title: post.title, content: post.content,
    imageUrl: post.imageUrl, likeCount: post.likeCount,
    createdAt: post.createdAt.toISOString(),
    user: post.user, commentCount: 0,
  }, { status: 201 })
}
