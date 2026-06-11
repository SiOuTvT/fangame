import { getSiteSetting } from "@/lib/site-settings"
import { RichTextContent } from "@/components/rich-text-content-wrapper"

export const metadata = { title: "关于 · 同人游戏站" }

function DefaultAbout() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">我们是谁</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          同人游戏站是一个面向 Galgame/视觉小说爱好者的社区平台。
          我们致力于为玩家提供一个发现、分享、讨论同人游戏的一站式入口。
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">核心功能</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "游戏收录", desc: "收录海量同人游戏资源，支持标签筛选、搜索、收藏" },
            { title: "制作组图鉴", desc: "通过 VNDB 数据展示脚本家、画师、音乐人等创作者信息" },
            { title: "社区论坛", desc: "求档、讨论、分享，社区互助的讨论空间" },
            { title: "收藏合集", desc: "自由创建收藏夹，管理你的游戏库" },
            { title: "成就系统", desc: "签到、收藏、评论解锁成就徽章" },
            { title: "角色图鉴", desc: "浏览游戏角色设定，随机发现新角色" },
          ].map(item => (
            <div key={item.title} className="rounded-xl bg-secondary/40 p-4">
              <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">技术栈</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Next.js 16 · React 19 · Prisma ORM · PostgreSQL · NextAuth v5 · Cloudflare R2 · Upstash Redis · TipTap 富文本编辑器 · shadcn/ui · Tailwind CSS
        </p>
      </div>
    </div>
  )
}

export default async function AboutPage() {
  const custom = await getSiteSetting("page_about")

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <h1 className="text-2xl font-bold text-foreground mb-6">关于同人游戏站</h1>
      <div className="rounded-2xl bg-card ring-1 ring-border p-6">
        {custom ? <RichTextContent html={custom} /> : <DefaultAbout />}
      </div>
    </div>
  )
}
