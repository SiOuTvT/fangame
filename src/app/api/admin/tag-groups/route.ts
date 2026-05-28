import { getAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { isValidPosition } from "@/lib/tag-positions"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const groups = await prisma.tagGroup.findMany({
    orderBy: [{ isPreset: "desc" }, { name: "asc" }],
    include: {
      tags: {
        orderBy: { name: "asc" },
        include: { _count: { select: { games: true } } },
      },
    },
  })
  return NextResponse.json(groups.map((g) => ({
    ...g,
    positions: JSON.parse(g.positions) as string[],
    tags: g.tags.map((t) => ({ ...t, gameCount: t._count.games })),
  })))
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const { name, description, color, positions } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "标签组名不能为空" }, { status: 400 })

  const exists = await prisma.tagGroup.findUnique({ where: { name: name.trim() } })
  if (exists) return NextResponse.json({ error: "标签组已存在" }, { status: 409 })

  // Validate positions
  const validPositions = Array.isArray(positions)
    ? positions.filter((p: string) => isValidPosition(p))
    : []

  const group = await prisma.tagGroup.create({
    data: {
      name: name.trim(),
      description: description?.trim() ?? "",
      color: color ?? "#7c8a9e",
      positions: JSON.stringify(validPositions),
    },
  })
  return NextResponse.json({ ...group, positions: validPositions }, { status: 201 })
}
