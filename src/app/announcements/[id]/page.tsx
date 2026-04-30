import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { ArrowLeft, ExternalLink } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ann = await prisma.announcement.findUnique({ where: { id }, select: { title: true } })
  return { title: ann ? `${ann.title} · 同人游戏站` : "公告" }
}

export default async function AnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ann = await prisma.announcement.findUnique({ where: { id } })
  if (!ann) notFound()

  // 解析内容：[img]url[/img] 渲染为图片，其余段落正常显示
  const blocks = ann.content.split(/\n\n+/)

  return (
    <div className="mx-auto max-w-2xl py-4">
      <Link href="/" className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        返回首页
      </Link>

      <h1 className="text-2xl font-bold leading-tight text-zinc-100">{ann.title}</h1>
      <p className="mt-2 text-xs text-zinc-600">
        {new Date(ann.createdAt).toLocaleString("zh-CN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
      </p>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-400">
        {blocks.map((block, i) => {
          const imgMatch = block.match(/^\[img\](.*?)\[\/img\]$/)
          if (imgMatch) {
            return (
              <div key={i} className="overflow-hidden rounded-xl">
                <Image src={imgMatch[1]} alt="" width={720} height={480} className="w-full object-cover" />
              </div>
            )
          }
          return (
            <p key={i} className="whitespace-pre-wrap">
              {block.replace(/\n/g, "\n")}
            </p>
          )
        })}
      </div>

      {ann.link && (
        <a
          href={ann.link}
          target="_blank"
          rel="noopener noreferrer"
          className="gradient-accent mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          查看详情
          <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
        </a>
      )}
    </div>
  )
}
