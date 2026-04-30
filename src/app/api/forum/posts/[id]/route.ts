import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await prisma.forumPost.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, username: true, avatar: true } } },
      },
    },
  })
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    ...post,
    isSolved: post.isSolved,
    createdAt: post.createdAt.toISOString(),
    comments: post.comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
  })
}
