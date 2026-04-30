import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminSession } from "@/lib/admin"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const logs = await prisma.gameLog.findMany({
    where: { gameId: id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(logs.map(l => ({ ...l, createdAt: l.createdAt.toISOString() })))
}

export async function POST(req: NextRequest, { params }: Ctx) {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const { id: gameId } = await params
  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: "内容不能为空" }, { status: 400 })

  const log = await prisma.gameLog.create({
    data: { gameId, content: content.trim() },
  })
  return NextResponse.json({ ...log, createdAt: log.createdAt.toISOString() }, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const { id: gameId } = await params
  const { logId } = await req.json()
  await prisma.gameLog.delete({ where: { id: logId, gameId } })
  return NextResponse.json({ ok: true })
}
