import { withHandler, json, noContent } from '@/lib/api-handler'
import { requireAuth } from '@/lib/auth-context'
import { gameService } from '@/services/game'

export const PUT = withHandler(async (req, ctx) => {
  const auth = await requireAuth()
  const { resourceId } = await ctx!.params
  const body = await req.json()
  const result = await gameService.updateResource(resourceId, auth.userId, auth.role, body)
  return json(result)
})

export const DELETE = withHandler(async (_req, ctx) => {
  const auth = await requireAuth()
  const { resourceId } = await ctx!.params
  await gameService.deleteResource(resourceId, auth.userId, auth.role)
  return noContent()
})
