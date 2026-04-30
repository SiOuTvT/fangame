import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { withRateLimit } from "@/lib/middleware"
import { rateLimits } from "@/lib/rate-limit"

/**
 * 简单的 HTML 转义函数，防止 XSS 攻击
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

async function handleComment(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const { id: gameId } = await params

  const content = (await req.formData()).get("content") as string
  if (!content?.trim()) return NextResponse.json({ error: "内容不能为空" }, { status: 400 })

  // 限制评论长度
  const trimmedContent = content.trim()
  if (trimmedContent.length > 2000)
    return NextResponse.json({ error: "评论内容不能超过2000字" }, { status: 400 })

  // XSS 防护：转义 HTML
  const sanitizedContent = escapeHtml(trimmedContent)

  const comment = await prisma.comment.create({
    data: { gameId, userId: session.user.id, content: sanitizedContent },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  })

  return NextResponse.json({ ...comment, createdAt: comment.createdAt.toISOString() }, { status: 201 })
}

export const POST = (req: NextRequest, context: { params: Promise<{ id: string }> }) =>
  withRateLimit(
    (r) => handleComment(r, context),
    rateLimits.comment,
    "comment"
  )(req)
