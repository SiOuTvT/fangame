import { withHandler, json } from "@/lib/api-handler"
import { prisma } from "@/lib/prisma"
import { ensureEmotionalMessages } from "@/lib/ensure-emotional-messages"
import { unstable_cache } from "next/cache"

const getAllMessages = unstable_cache(
  async () => {
    return prisma.emotionalMessage.findMany({
      where: { enabled: true },
      orderBy: [{ category: "asc" }, { key: "asc" }],
    })
  },
  ["emotional-messages"],
  { revalidate: 300, tags: ["emotional-messages"] }
)

export const GET = withHandler(async (req) => {
  await ensureEmotionalMessages()
  const category = req.nextUrl.searchParams.get("category")
  const key = req.nextUrl.searchParams.get("key")

  const all = await getAllMessages()

  if (key) {
    return json(all.find(m => m.key === key) || null)
  }
  if (category) {
    return json(all.filter(m => m.category === category))
  }
  return json(all)
})
