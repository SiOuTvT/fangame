import { withHandler, json } from "@/lib/api-handler"
import { prisma } from "@/lib/prisma"
import { NotFoundError, ValidationError } from "@/lib/errors"

// GET — 公开：单个合集详情（含全部游戏）
export const GET = withHandler(async (req, ctx) => {
  const id = (await ctx?.params)?.id
  if (!id) throw new ValidationError("缺少合集 ID")

  const collection = await prisma.curatedCollection.findUnique({
    where: { id, published: true },
    include: {
      games: {
        orderBy: { sortOrder: "asc" },
        include: {
          game: {
            select: {
              id: true, serialId: true, title: true, coverImage: true,
              studioName: true, releaseDate: true, description: true,
            },
          },
        },
      },
      _count: { select: { games: true } },
    },
  })

  if (!collection) throw new NotFoundError("合集")
  return json(collection)
})
