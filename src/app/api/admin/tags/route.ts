import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminSession } from "@/lib/admin"

export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { games: true } } },
  })
  return NextResponse.json(tags.map((t) => ({ ...t, gameCount: t._count.games })))
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const { name, color } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "标签名不能为空" }, { status: 400 })

  const exists = await prisma.tag.findUnique({ where: { name: name.trim() } })
  if (exists) return NextResponse.json({ error: "标签已存在" }, { status: 409 })

  const tag = await prisma.tag.create({ data: { name: name.trim(), color: color ?? "#a78bfa" } })
  return NextResponse.json(tag, { status: 201 })
}
