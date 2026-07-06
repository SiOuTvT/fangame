import { ok, serverError } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"
import { logger } from "@/lib/logger"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: id },
      select: {
        game: {
          select: { id: true, serialId: true, title: true, coverImage: true, isNsfw: true, originalWork: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    })
    return ok({ favorites: favorites.map((f) => f.game) })
  } catch (error) {
    logger.api.error("Profile Favorites API", error)
    return serverError("获取收藏失败")
  }
}
