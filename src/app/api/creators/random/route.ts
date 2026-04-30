import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const count = await prisma.creator.count()
  if (!count) return NextResponse.json({ error: "暂无创作者" }, { status: 404 })

  const skip = Math.floor(Math.random() * count)
  const creator = await prisma.creator.findFirst({ skip, select: { id: true } })
  return NextResponse.json({ id: creator?.id })
}
