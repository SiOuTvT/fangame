import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ForumClient } from "@/components/forum-client"

export const metadata = { title: "求档区 · 同人游戏站" }

export default async function ForumPage() {
  const session = await auth()

  const posts = await prisma.forumPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { comments: true } },
    },
  })

  const initialPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    imageUrl: p.imageUrl,
    likeCount: p.likeCount,
    isSolved: p.isSolved,
    createdAt: p.createdAt.toISOString(),
    user: p.user,
    commentCount: p._count.comments,
  }))

  return (
    <ForumClient
      initialPosts={initialPosts}
      isLoggedIn={!!session?.user}
      currentUser={session?.user ? { id: session.user.id!, name: session.user.name ?? "", image: session.user.image ?? "" } : null}
    />
  )
}
