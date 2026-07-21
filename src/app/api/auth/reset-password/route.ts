import { withHandler, json, safeParseJson } from '@/lib/api-handler'
import { authService } from '@/services/user'
import { checkRateLimit, rateLimits } from '@/lib/rate-limit'
import { RateLimitError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const GET = withHandler(async (req) => {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) return json({ valid: false })

  const hash = crypto.createHash("sha256").update(token).digest("hex")
  const record = await prisma.passwordResetToken.findUnique({
    where: { token: hash },
    select: { usedAt: true, expiresAt: true, user: { select: { email: true } } },
  })

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return json({ valid: false })
  }

  return json({ valid: true, email: record.user.email })
})

export const POST = withHandler(async (req) => {
  const rl = await checkRateLimit(rateLimits.passwordReset)
  if (!rl.success) throw new RateLimitError("请求过于频繁，请稍后再试", rl.reset)

  const { token, password } = await safeParseJson(req)
  const result = await authService.resetPassword(token, password)
  return json(result)
})
