import { getAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const { id } = await params

  const gameCreators = await prisma.gameCreator.findMany({
    where: { creatorId: id },
    include: {
      game: {
        select: {
          id: true,
          title: true,
          coverImage: true,
        },
      },
    },
    orderBy: { game: { createdAt: "desc" } },
  })

  // 去重：同一个游戏可能有多个角色，合并为一条
  const gameMap = new Map<string, { id: string; title: string; coverImage: string | null; roles: string[] }>()
  for (const gc of gameCreators) {
    const existing = gameMap.get(gc.game.id)
    if (existing) {
      existing.roles.push(gc.role)
    } else {
      gameMap.set(gc.game.id, {
        id: gc.game.id,
        title: gc.game.title,
        coverImage: gc.game.coverImage,
        roles: [gc.role],
      })
    }
  }

  return NextResponse.json(Array.from(gameMap.values()))
}
