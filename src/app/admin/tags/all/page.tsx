import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { AllTagsClient } from "./client"

export const dynamic = "force-dynamic"

export default async function AllTagsPage() {
  await requireAdmin()

  const [tags, groups] = await Promise.all([
    prisma.tag.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        color: true,
        isVisible: true,
        groupId: true,
        group: { select: { id: true, name: true, color: true } },
        _count: { select: { games: true } },
      },
    }),
    prisma.tagGroup.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
  ])

  const mapped = tags.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
    gameCount: t._count.games,
    isVisible: t.isVisible,
    groupId: t.groupId,
    groupName: t.group?.name ?? null,
    groupColor: t.group?.color ?? null,
  }))

  return <AllTagsClient tags={mapped} groups={groups} />
}
