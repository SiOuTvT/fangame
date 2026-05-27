import { getAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// POST - 批量更新公告排序
export async function POST(req: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const { orderedIds } = await req.json()
  if (!Array.isArray(orderedIds)) return NextResponse.json({ error: "参数错误" }, { status: 400 })

  // 使用事务批量更新 sortOrder
  await prisma.$transaction(
    orderedIds.map((id: string, index: number) =>
      prisma.announcement.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  )

  return NextResponse.json({ success: true })
}