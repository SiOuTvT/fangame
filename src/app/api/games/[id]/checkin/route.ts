import { ok, serverError, unauthorized } from "@/lib/api-response"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cache, cacheKey } from "@/lib/redis"

// GET /api/games/[id]/checkin - 检查用户今日是否已签到
async function handleGetCheckinStatus(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params
  const session = await auth()
  if (!session?.user?.id) return ok({ done: false, days: 0 })

  const todayStr = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" })
  const today = new Date(todayStr + "T00:00:00.000Z")

  try {
    const [existing, total] = await Promise.all([
      prisma.checkIn.findUnique({
        where: { userId_date: { userId: session.user.id, date: today } },
      }),
      prisma.checkIn.count({ where: { userId: session.user.id } }),
    ])

    const cacheKeyGames = cacheKey("checkin:games", gameId, session.user.id, todayStr)
    if (existing) {
      await cache.set(cacheKeyGames, { done: true, days: total }, 3600)
    }

    return ok({ done: !!existing, days: total })
  } catch {
    return ok({ done: false, days: 0 })
  }
}

// POST /api/games/[id]/checkin - 执行签到
async function handleCheckin(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params
  const session = await auth()
  if (!session?.user?.id) return unauthorized()

  const todayStr = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" })
  const today = new Date(todayStr + "T00:00:00.000Z")

  try {
    const existing = await prisma.checkIn.findUnique({
      where: { userId_date: { userId: session.user.id, date: today } },
    })

    if (existing) {
      const total = await prisma.checkIn.count({ where: { userId: session.user.id } })
      return ok({ done: true, days: total, alreadyDone: true })
    }

    await prisma.checkIn.create({ data: { userId: session.user.id, date: today } })

    const total = await prisma.checkIn.count({ where: { userId: session.user.id } })

    // 随机生成印记数量
    const rand = Math.random() * 100
    let marks = 0
    if (rand < 2) marks = 0
    else if (rand < 10) marks = 1
    else if (rand < 25) marks = 2
    else if (rand < 50) marks = 3
    else if (rand < 80) marks = 4
    else marks = 5

    // 缓存签到状态
    const cacheKeyGames = cacheKey("checkin:games", gameId, session.user.id, todayStr)
    await cache.set(cacheKeyGames, { done: true, days: total, marks }, 3600)

    return ok({ done: true, days: total, marks })
  } catch (error) {
    return serverError("签到失败")
  }
}

export { handleCheckin as POST, handleGetCheckinStatus as GET }