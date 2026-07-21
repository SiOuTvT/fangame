import { withHandler, json, noContent } from "@/lib/api-handler"
import { requireAuth } from "@/lib/auth-context"
import { notificationService } from "@/services/user"

export const GET = withHandler(async (req) => {
  const { userId } = await requireAuth()
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1"))
  const unreadOnly = req.nextUrl.searchParams.get("unreadOnly") === "true"
  const data = await notificationService.getPaginated(userId, page, unreadOnly)
  return json(data)
})

export const PUT = withHandler(async (req) => {
  const { userId } = await requireAuth()
  const body = await req.json().catch(() => ({}))
  if (body.ids?.length) {
    await notificationService.markRead(body.ids, userId)
  } else {
    await notificationService.markAllRead(userId)
  }
  return json({ ok: true })
})

export const DELETE = withHandler(async (req) => {
  const { userId } = await requireAuth()
  const body = await req.json().catch(() => ({}))
  if (body.ids?.length) {
    await notificationService.deleteNotifications(body.ids, userId)
  } else {
    await notificationService.deleteAllRead(userId)
  }
  return noContent()
})
