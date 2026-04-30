import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const existing = await prisma.checkIn.findUnique({
    where: { userId_date: { userId: session.user.id, date: today } },
  })
  if (existing) return NextResponse.json({ error: "今日已签到", alreadyDone: true }, { status: 409 })

  await prisma.checkIn.create({ data: { userId: session.user.id, date: today } })

  const total = await prisma.checkIn.count({ where: { userId: session.user.id } })
  return NextResponse.json({ ok: true, total, date: today })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ checkedIn: false, total: 0 })

  const today = new Date().toISOString().slice(0, 10)
  const [existing, total] = await Promise.all([
    prisma.checkIn.findUnique({ where: { userId_date: { userId: session.user.id, date: today } } }),
    prisma.checkIn.count({ where: { userId: session.user.id } }),
  ])

  return NextResponse.json({ checkedIn: !!existing, total })
}
