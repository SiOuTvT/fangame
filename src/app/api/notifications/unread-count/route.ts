import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/notifications/unread-count - 轻量轮询端点，仅返回未读数
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ unreadCount: 0 })
  }

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  })

  return NextResponse.json({ unreadCount })
}
