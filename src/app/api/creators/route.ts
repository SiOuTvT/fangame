import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const creators = await prisma.creator.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, nameJa: true, avatar: true, gender: true,
      games: { select: { role: true }, take: 1 },
      _count: { select: { games: true } },
    },
  })
  return NextResponse.json(creators)
}
