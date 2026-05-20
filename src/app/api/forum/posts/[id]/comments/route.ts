import { badRequest, created, tooManyRequests, unauthorized } from "@/lib/api-response"
import { auth } from "@/lib/auth"
import { createNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, rateLimits } from "@/lib/rate-limit"
import { sanitizeString } from "@/lib/sanitize"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 速率限制：每分钟最多10条评论
  const rateLimit = await checkRateLimit(rateLimits.comment)
  if (!rateLimit.success) {
    return tooManyRequests("请求过于频繁，请稍后再试")
  }

  const session = await auth()
  if (!session?.user?.id) return unauthorized()
  const { id: postId } = await params

  const fd = await req.formData()
  const content = sanitizeString((fd.get("content") as string)?.trim())
  if (!content) return badRequest("内容不能为空")

  // 获取帖子作者 ID
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { userId: true },
  })

  const comment = await prisma.forumComment.create({
    data: { postId, userId: session.user.id, content },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  })

  // 通知帖子作者有新评论
  if (post) {
    createNotification({
      userId: post.userId,
      actorId: session.user.id,
      type: "forum_comment_new",
      targetType: "forum_post",
      targetId: postId,
    }).catch(() => {})
  }

  return created({ ...comment, createdAt: comment.createdAt.toISOString() })
}
