import { withHandler, json } from "@/lib/api-handler"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

const getAchievements = unstable_cache(
  async () => {
    return prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: { category: "asc" },
    })
  },
  ["achievements"],
  { revalidate: 300, tags: ["achievements"] }
)

export const GET = withHandler(async () => {
  return json(await getAchievements())
})
