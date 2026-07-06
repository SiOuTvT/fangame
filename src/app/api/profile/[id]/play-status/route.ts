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
    const playStatuses = await prisma.playStatus.findMany({
      where: { userId: id },
      select: {
        status: true,
        game: {
          select: { id: true, serialId: true, title: true, coverImage: true, isNsfw: true, originalWork: true },
        },
      },
      orderBy: { id: "desc" },
      take: 200,
    })
    return ok({ playStatuses: playStatuses.map((ps) => ({ game: ps.game, status: ps.status })) })
  } catch (error) {
    logger.api.error("Profile PlayStatus API", error)
    return serverError("获取游玩状态失败")
  }
}
