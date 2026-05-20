import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (!q || q.length < 1) return NextResponse.json([])

  const games = await prisma.game.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { originalWork: { contains: q, mode: "insensitive" } },
        { englishName: { contains: q, mode: "insensitive" } },
        { aliases: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 8,
    select: {
      id: true,
      title: true,
      coverImage: true,
      originalWork: true,
    },
  })

  return NextResponse.json(games)
}