"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Gamepad2, Tag, Megaphone, ArrowLeft, Music, Users, UserCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { icon: LayoutDashboard, label: "仪表盘",   href: "/admin" },
  { icon: Gamepad2,        label: "游戏管理",  href: "/admin/games" },
  { icon: Tag,             label: "标签管理",  href: "/admin/tags" },
  { icon: UserCircle2,     label: "创作者管理", href: "/admin/creators" },
  { icon: Megaphone,       label: "公告管理",  href: "/admin/announcements" },
  { icon: Music,           label: "音乐管理",  href: "/admin/music" },
  { icon: Users,           label: "用户管理",  href: "/admin/users" },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-white/[0.06] bg-zinc-900">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-5 py-2">
        <Link href="/" className="mr-3 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          前台
        </Link>
        <div className="h-4 w-px bg-zinc-800 mr-2" />
        {items.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
              pathname === href
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
