import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminSession } from "@/lib/admin"

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const { id } = await params

  const body = await req.json().catch(() => ({}))
  const data: Record<string, unknown> = {}
  if ("isActive" in body) data.isActive = body.isActive
  if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim()
  if (typeof body.url === "string" && body.url.trim()) data.url = body.url.trim()

  if (Object.keys(data).length === 0) return NextResponse.json({ error: "没有要更新的字段" }, { status: 400 })

  const m = await prisma.music.update({ where: { id }, data })
  return NextResponse.json(m)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const { id } = await params
  await prisma.music.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
