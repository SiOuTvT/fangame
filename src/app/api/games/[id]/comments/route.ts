import { auth } from "@/lib/auth"
import { withRateLimit } from "@/lib/middleware"
import { prisma } from "@/lib/prisma"
import { rateLimits } from "@/lib/rate-limit"
import { NextRequest, NextResponse } from "next/server"

async function handleComment(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const { id: gameId } = await context.params

  const formData = await req.formData()
  const content = (formData.get("content") as string)?.trim()
  const image = formData.get("image") as File | null

  if (!content?.trim()) return NextResponse.json({ error: "内容不能为空" }, { status: 400 })

  let imageUrl: string | null = null

  // 处理图片上传（如果提供了图片）
  if (image && image.size > 0) {
    // 验证文件类型和大小
    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "只支持图片文件" }, { status: 400 })
    }
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "图片大小不能超过 5MB" }, { status: 400 })
    }

    // 将图片转换为 base64 存储
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    imageUrl = `data:${image.type};base64,${buffer.toString("base64")}`
  }

  const comment = await prisma.comment.create({
    data: { 
      gameId, 
      userId: session.user.id, 
      content: content.trim(),
      imageUrl: imageUrl || "",
    },
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