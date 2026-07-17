import { withHandler, json } from '@/lib/api-handler'
import { gameService } from '@/services/game'
import { getRateLimit, getClientIP } from '@/lib/rate-limit'

// 同一 IP 每分钟最多 10 次浏览量增加
const VIEW_RATE_LIMIT = { windowMs: 60_000, maxRequests: 10 }

export const POST = withHandler(async (req, ctx) => {
  const ip = getClientIP(req)
  const { id } = await ctx!.params
  const rl = await getRateLimit(`view:${ip}:${id}`, VIEW_RATE_LIMIT)
  if (!rl.allowed) return json({ viewCount: null, limited: true })
  const result = await gameService.incrementView(id)
  return json(result)
})
