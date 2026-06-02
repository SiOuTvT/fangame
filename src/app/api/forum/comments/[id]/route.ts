import { forbidden, notFound, unauthorized } from "@/lib/api-response"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return unauthorized()
  const { id } = await params

  const comment = await prisma.forumComment.findUnique({ where: { id } })
  if (!comment) return notFound()
  // 只允许作者或管理员删除
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (comment.userId !== session.user.id && dbUser?.role !== "ADMIN") return forbidden()

  await prisma.forumComment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}