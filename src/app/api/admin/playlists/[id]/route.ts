import { withHandler, json, noContent } from "@/lib/api-handler"
import { requireAdminRole } from "@/lib/auth-context"
import { prisma } from "@/lib/prisma"
import { ValidationError, NotFoundError } from "@/lib/errors"

export const GET = withHandler(async (_req, ctx) => {
  await requireAdminRole()
  const { id } = await ctx!.params
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: { music: { orderBy: { createdAt: "desc" } } },
  })
  if (!playlist) throw new NotFoundError("播放列表")
  return json(playlist)
})

export const PUT = withHandler(async (req, ctx) => {
  await requireAdminRole()
  const { id } = await ctx!.params
  const { name } = await req.json()
  if (!name?.trim()) {
    throw new ValidationError("名称不能为空")
  }
  await prisma.playlist.update({ where: { id }, data: { name: name.trim() } })
  return json({ ok: true })
})

export const DELETE = withHandler(async (_req, ctx) => {
  await requireAdminRole()
  const { id } = await ctx!.params
  await prisma.music.updateMany({ where: { playlistId: id }, data: { playlistId: null } })
  await prisma.playlist.delete({ where: { id } })
  return noContent()
})
