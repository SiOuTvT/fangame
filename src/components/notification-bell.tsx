"use client"

import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Bell, Check, Heart, MessageSquare, UserPlus } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

interface NotificationItem {
  id: string
  type: string
  targetType: string
  targetId: string
  isRead: boolean
  createdAt: string
  actor: {
    id: string
    username: string
    avatar: string
  }
}

const TYPE_CONFIG: Record<string, { icon: typeof Heart; text: (actor: string) => string; href: (targetType: string, targetId: string) => string }> = {
  forum_post_like: {
    icon: Heart,
    text: (actor) => `${actor} 赞了你的帖子`,
    href: (_type, _id) => "/forum",
  },
  forum_comment_like: {
    icon: Heart,
    text: (actor) => `${actor} 赞了你的评论`,
    href: (_type, _id) => "/forum",
  },
  forum_comment_new: {
    icon: MessageSquare,
    text: (actor) => `${actor} 评论了你的帖子`,
    href: (_type, _id) => "/forum",
  },
  follow: {
    icon: UserPlus,
    text: (actor) => `${actor} 关注了你`,
    href: (_type, id) => `/profile/${id}`,
  },
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnreadCount(data.unreadCount ?? 0)
    } catch {
      // ignore
    }
  }, [])

  // 每 30 秒轮询一次未读数
  useEffect(() => {
    fetchNotifications()
    const timer = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(timer)
  }, [fetchNotifications])

  // 点击外部关闭
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  async function markAllRead() {
    setLoading(true)
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // ignore
    }
    setLoading(false)
  }

  async function markRead(ids: string[]) {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - ids.length))
    } catch {
      // ignore
    }
  }

  function timeAgo(dateStr: string) {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: zhCN })
    } catch {
      return ""
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => {
          setOpen(!open)
          if (!open) fetchNotifications()
        }}
        className="relative rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        aria-label="通知"
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl ring-1 ring-white/[0.08]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <span className="text-sm font-semibold text-zinc-100">通知</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={loading}
                className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
              >
                <Check className="h-3 w-3" />
                全部已读
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-zinc-600">暂无通知</div>
            ) : (
              notifications.map((n) => {
                const config = TYPE_CONFIG[n.type]
                if (!config) return null
                const Icon = config.icon
                return (
                  <Link
                    key={n.id}
                    href={config.href(n.targetType, n.targetId)}
                    onClick={() => {
                      if (!n.isRead) markRead([n.id])
                      setOpen(false)
                    }}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-zinc-800/60 ${
                      n.isRead ? "" : "bg-zinc-800/30"
                    }`}
                  >
                    {/* Actor avatar or icon */}
                    {n.actor.avatar ? (
                      <img
                        src={n.actor.avatar}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                        <Icon className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-zinc-300">
                        {config.text(n.actor.username)}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-600">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>

                    {!n.isRead && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}