"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  Menu, Search, Sun, Moon, User, LogOut, X,
  MessageSquare, Layers, FileQuestion, UserCircle2,
  CalendarCheck, ShieldAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"

const MENU_ITEMS = [
  { icon: Layers,       label: "精选合集", href: "/collections" },
  { icon: FileQuestion, label: "求档中心", href: "/forum" },
  { icon: UserCircle2,  label: "创作者",   href: "/creators" },
]

function getCookie(name: string) {
  if (typeof document === "undefined") return null
  return document.cookie.split(";").map(s => s.trim()).find(s => s.startsWith(name + "="))?.split("=")[1] ?? null
}
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=31536000`
}

export function TopNav() {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user

  const [menuOpen, setMenuOpen]   = useState(false)
  const [userOpen, setUserOpen]   = useState(false)
  const [forumOpen, setForumOpen] = useState(false)
  const [theme, setTheme]         = useState<"dark" | "light">("dark")
  const [nsfw, setNsfw]           = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null
    const t = savedTheme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    setTheme(t)
    document.documentElement.classList.toggle("light", t === "light")

    const nsfwVal = getCookie("nsfw_status") === "1"
    setNsfw(nsfwVal)

    // 签到状态完全依赖后端，不再使用 localStorage
    fetch("/api/checkin")
      .then(r => r.json())
      .then(data => setCheckedIn(data.checkedIn))
      .catch(() => setCheckedIn(false))
  }, [])

  // 点击外部关闭下拉，用 mousedown 避免与 click 冲突
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false)
      }
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [])

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.classList.toggle("light", next === "light")
    localStorage.setItem("theme", next)
  }

  function toggleNsfw() {
    const next = !nsfw
    setNsfw(next)
    localStorage.setItem("nsfw_status", next ? "1" : "0")
    setCookie("nsfw_status", next ? "1" : "0")
    router.refresh()
  }

  function handleCheckin() {
    if (checkedIn) return
    fetch("/api/checkin", { method: "POST" })
      .then(r => r.json())
      .then(data => {
        if (data.ok || data.alreadyDone) {
          setCheckedIn(true)
        }
      })
      .catch(() => {})
    setUserOpen(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.07] bg-zinc-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-2 px-4" style={{ paddingLeft: "60px" }}>

          {/* 论坛按钮 */}
          <button
            onClick={() => setForumOpen(v => !v)}
            className={cn(
              "absolute left-0 flex h-14 w-14 items-center justify-center border-r border-white/[0.07] transition-colors",
              forumOpen ? "bg-zinc-800/80 text-zinc-200" : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200"
            )}
          >
            <MessageSquare className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {/* 三条杠菜单 */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-zinc-200"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
            {menuOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900 shadow-2xl">
                {MENU_ITEMS.map(({ icon: Icon, label, href }) => (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100">
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 首页 */}
          <Link href="/" className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-200">
            首页
          </Link>

          {/* 右侧 */}
          <div className="ml-auto flex items-center gap-1">
            <Link href="/search" className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-zinc-200">
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </Link>

            <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-zinc-200">
              {theme === "dark" ? <Sun className="h-5 w-5" strokeWidth={1.5} /> : <Moon className="h-5 w-5" strokeWidth={1.5} />}
            </button>

            {user ? (
              <div ref={userRef} className="relative ml-1">
                <button
                  onClick={() => setUserOpen(v => !v)}
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/10 transition-all hover:ring-white/25"
                >
                  {user.image
                    ? <img src={user.image} alt={user.name ?? ""} className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-500 to-purple-500 text-xs font-bold text-white">{(user.name ?? "U")[0].toUpperCase()}</div>
                  }
                </button>

                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900 shadow-2xl">
                    <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-xs font-bold text-white">
                        {user.image
                          ? <img src={user.image} alt="" className="h-full w-full object-cover" />
                          : (user.name ?? "U")[0].toUpperCase()}
                      </div>
                      <span className="truncate text-sm font-semibold text-zinc-100">{user.name}</span>
                    </div>

                    <Link href={`/profile/${user.id}`} onClick={() => setUserOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100">
                      <User className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      用户主页
                    </Link>

                    <button onClick={handleCheckin} disabled={checkedIn}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                        checkedIn ? "cursor-default text-zinc-600" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                      )}>
                      <CalendarCheck className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      {checkedIn ? "今日已签到 ✓" : "每日签到"}
                    </button>

                    <button onClick={toggleNsfw}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100">
                      <span className="flex items-center gap-3">
                        <ShieldAlert className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                        NSFW 内容
                      </span>
                      <div className={cn("relative h-5 w-9 rounded-full transition-colors", nsfw ? "bg-red-500/60" : "bg-zinc-700")}>
                        <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", nsfw ? "translate-x-4" : "translate-x-0.5")} />
                      </div>
                    </button>

                    <div className="border-t border-white/[0.06]" />

                    <button onClick={() => { setUserOpen(false); signOut({ callbackUrl: "/" }) }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-zinc-800">
                      <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-1 flex items-center gap-2">
                <Link href="/login" className="rounded-full border border-white/[0.08] bg-zinc-800/60 px-3 py-1 text-xs text-zinc-400 transition-all hover:border-white/20 hover:text-zinc-200">
                  登录
                </Link>
                <Link href="/register" className="gradient-accent rounded-full px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90">
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 论坛侧边栏遮罩 */}
      {forumOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setForumOpen(false)} />
      )}

      {/* 论坛侧边栏 */}
      <aside className={cn(
        "fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-72 flex-col border-r border-white/[0.06] bg-zinc-950/92 backdrop-blur-2xl transition-transform duration-300 ease-in-out",
        forumOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <span className="text-sm font-semibold text-zinc-200">论坛动态</span>
          <button onClick={() => setForumOpen(false)} className="text-zinc-500 transition-colors hover:text-zinc-300">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <ForumRailContent />
        </div>
        <div className="border-t border-white/[0.06] p-3">
          <Link href="/forum" onClick={() => setForumOpen(false)}
            className="flex w-full items-center justify-center rounded-xl bg-zinc-800 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200">
            进入求档区 →
          </Link>
        </div>
      </aside>
    </>
  )
}

function ForumRailContent() {
  const [posts, setPosts] = useState<{ id: string; title: string; user: { username: string } }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/forum/posts")
      .then(r => r.json())
      .then(data => { setPosts(data.slice(0, 20)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="p-4 text-xs text-zinc-600">加载中…</p>
  if (!posts.length) return <p className="p-4 text-xs text-zinc-600">暂无帖子，来发第一帖吧~</p>

  return (
    <div className="space-y-0.5">
      {posts.map(p => (
        <Link key={p.id} href="/forum"
          className="block w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-800/60">
          <p className="mb-0.5 text-[10px] text-zinc-600">{p.user.username}</p>
          <p className="line-clamp-2 text-xs font-medium text-zinc-400">{p.title}</p>
        </Link>
      ))}
    </div>
  )
}
