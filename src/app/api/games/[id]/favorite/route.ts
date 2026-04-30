import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const { id: gameId } = await params
  const userId = session.user.id

  const existing = await prisma.favorite.findUnique({ where: { userId_gameId: { userId, gameId } } })

  if (existing) {
    await prisma.favorite.delete({ where: { userId_gameId: { userId, gameId } } })
    const game = await prisma.game.update({ where: { id: gameId }, data: { favoriteCount: { decrement: 1 } }, select: { favoriteCount: true } })
    return NextResponse.json({ isFav: false, count: Math.max(0, game.favoriteCount) })
  } else {
    await prisma.favorite.create({ data: { userId, gameId } })
    const game = await prisma.game.update({ where: { id: gameId }, data: { favoriteCount: { increment: 1 } }, select: { favoriteCount: true } })
    return NextResponse.json({ isFav: true, count: game.favoriteCount })
  }
}
