import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const music = await prisma.music.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, url: true },
  })
  return NextResponse.json(music)
}
