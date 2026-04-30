import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const { id: gameId } = await params
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown"

  await prisma.gameReport.upsert({
    where: { gameId_ip: { gameId, ip } },
    create: { gameId, ip },
    update: {},
  })

  const count = await prisma.gameReport.count({ where: { gameId } })
  return NextResponse.json({ count, archiving: count >= 3 })
}
