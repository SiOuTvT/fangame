import { getAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })

  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const action = searchParams.get("action") || ""
  const limit = 30
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (action) where.action = action

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip, take: limit,
      include: { user: { select: { id: true, username: true, avatar: true } } },
    }),
    prisma.auditLog.count({ where }),
  ])

  return NextResponse.json({
    logs: logs.map(l => ({ ...l, createdAt: l.createdAt.toISOString() })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
