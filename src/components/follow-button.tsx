"use client"

import { Loader2, UserMinus, UserPlus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface Props {
  targetUserId: string
  initialFollowing: boolean
}

export function FollowButton({ targetUserId, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (loading) return
    setLoading(true)
    try {
      const method = following ? "DELETE" : "POST"
      const res = await fetch(`/api/follow/${targetUserId}`, { method })
      if (res.ok) {
        setFollowing(!following)
        toast.success(following ? "已取消关注" : "关注成功")
      } else {
        toast.error("出了点问题，等一下再试试？")
      }
    } catch {
      toast.error("网络好像断了", {
        action: { label: "重试", onClick: () => toggle() },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
        following
          ? "bg-secondary text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400"
          : "bg-primary text-primary-foreground hover:opacity-90"
      } disabled:opacity-50`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : following ? (
        <UserMinus className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {following ? "已关注" : "关注"}
    </button>
  )
}