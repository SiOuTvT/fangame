import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get("q")?.trim() || ""
  const tag = searchParams.get("tag")?.trim() || ""
  const nsfw = searchParams.get("nsfw") === "1"
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(60, parseInt(searchParams.get("limit") || "24"))
  const skip = (page - 1) * limit

  const where: Prisma.GameWhereInput = {
    isPublished: true,
    ...(nsfw ? {} : { isNsfw: false }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { originalWork: { contains: q, mode: "insensitive" } },
        { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
      ],
    }),
    ...(tag && {
      tags: { some: { tag: { name: tag } } },
    }),
  }

  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        coverImage: true,
        status: true,
        isNsfw: true,
        favoriteCount: true,
        viewCount: true,
        createdAt: true,
        description: true,
        tags: { select: { tag: { select: { name: true, color: true } } } },
      },
    }),
    prisma.game.count({ where }),
  ])

  const data = games.map((g) => ({
    ...g,
    tags: g.tags.map((t) => t.tag),
  }))

  return NextResponse.json({ games: data, total, page, limit })
}
