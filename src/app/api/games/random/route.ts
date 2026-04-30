import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const nsfw = req.nextUrl.searchParams.get("nsfw") === "1"

  const count = await prisma.game.count({
    where: { isPublished: true, ...(nsfw ? {} : { isNsfw: false }) },
  })
  if (!count) return NextResponse.json({ error: "暂无游戏" }, { status: 404 })

  const skip = Math.floor(Math.random() * count)
  const game = await prisma.game.findFirst({
    where: { isPublished: true, ...(nsfw ? {} : { isNsfw: false }) },
    skip,
    select: { id: true },
  })

  return NextResponse.json({ id: game?.id })
}
