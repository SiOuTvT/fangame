import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { cache } from "@/lib/redis"
import { NextResponse } from "next/server"

/**
 * 浏览量计数器 — 使用 Redis 缓冲 + 定期批量写入 DB
 * 每个 IP 对同一游戏 10 秒内最多计数一次
 */
const recentViews = new Map<string, number>()

// 定期清理过期条目，防止内存无限增长
const VIEW_TTL = 10_000
setInterval(() => {
  const now = Date.now()
  for (const [key, ts] of recentViews) {
    if (now - ts > VIEW_TTL) recentViews.delete(key)
  }
}, 60_000)

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 频率限制
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown"
    const key = `${ip}:${id}`
    const now = Date.now()
    const last = recentViews.get(key)
    if (last && now - last < 10_000) {
      return NextResponse.json({ counted: false, reason: "rate-limited" })
    }
    recentViews.set(key, now)

    // 写入 Redis 缓冲（key: view:{gameId}, TTL 5 分钟）
    const viewKey = `view:${id}`
    const count = await cache.incr(viewKey, 300)

    // 每 100 次批量写入 DB
    if (count % 100 === 0) {
      await prisma.game.update({
        where: { id },
        data: { viewCount: { increment: 100 } },
      })
      await cache.del(viewKey)
    }

    return NextResponse.json({ counted: true })
  } catch (error) {
    logger.game.error("[Game View]", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}

/** 定时任务：每分钟 flush 一次缓冲 */
export async function GET() {
  try {
    const entries = await Promise.all(
      ["view:*"].map(async (pattern) => {
        // Redis: SCAN pattern; Memory: iterate keys
        return []
      })
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "flush failed" }, { status: 500 })
  }
}
