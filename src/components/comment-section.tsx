"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Heart, ImageIcon, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  content: string
  imageUrl: string
  likeCount: number
  createdAt: string
  user: { id: string; username: string; avatar: string }
}

interface Props {
  gameId: string
  comments: Comment[]
  isLoggedIn: boolean
  currentUserId?: string
}

function Avatar({ user }: { user: Comment["user"] }) {
  if (user.avatar) {
    return <Image src={user.avatar} alt={user.username} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-xs font-bold text-white">
      {user.username[0].toUpperCase()}
    </div>
  )
}

export function CommentSection({ gameId, comments: init, isLoggedIn }: Props) {
  const [comments, setComments] = useState(init)
  const [content, setContent] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() && !fileRef.current?.files?.[0]) return
    setSubmitting(true)
    const fd = new FormData()
    fd.append("content", content.trim())
    if (fileRef.current?.files?.[0]) fd.append("image", fileRef.current.files[0])

    const res = await fetch(`/api/games/${gameId}/comments`, { method: "POST", body: fd })
    if (res.ok) {
      const c = await res.json()
      setComments((prev) => [c, ...prev])
      setContent("")
      setPreviewUrl(null)
      if (fileRef.current) fileRef.current.value = ""
    }
    setSubmitting(false)
  }

  async function likeComment(commentId: string) {
    const res = await fetch(`/api/comments/${commentId}/like`, { method: "POST" })
    if (res.ok) {
      const data = await res.json()
      setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, likeCount: data.count } : c))
    }
  }

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
        <span className="h-4 w-0.5 rounded-full bg-gradient-to-b from-pink-400 to-purple-400" />
        评论
        <span className="text-xs font-normal text-zinc-500">{comments.length}</span>
      </h2>

      {/* 发评论 */}
      {isLoggedIn ? (
        <form onSubmit={submit} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的想法…"
            rows={3}
            className="w-full resize-none rounded-xl bg-zinc-900 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 ring-1 ring-white/[0.06] outline-none transition-all focus:ring-pink-500/30"
          />
          {previewUrl && (
            <div className="mt-2 relative inline-block">
              <Image src={previewUrl} alt="预览" width={120} height={120} className="rounded-lg object-cover" />
              <button type="button" onClick={() => { setPreviewUrl(null); if (fileRef.current) fileRef.current.value = "" }}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-[10px] text-zinc-300 hover:bg-zinc-600">✕</button>
            </div>
          )}
          <div className="mt-2 flex items-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 ring-1 ring-white/[0.06] hover:bg-zinc-700 hover:text-zinc-200 transition-colors">
              <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
              图片
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button type="submit" disabled={submitting}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-zinc-800 px-4 py-1.5 text-xs font-medium text-zinc-300 ring-1 ring-white/[0.06] transition-all hover:bg-zinc-700 hover:text-white disabled:opacity-50">
              <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
              {submitting ? "发送中…" : "发送"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-6 text-sm text-zinc-500">
          <a href="/login" className="text-pink-400 hover:text-pink-300 transition-colors">登录</a>后可以发表评论
        </p>
      )}

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-600">还没有评论，来说点什么吧~</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <Avatar user={c.user} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-zinc-300">{c.user.username}</span>
                <span className="text-[10px] text-zinc-600">
                  {new Date(c.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {c.content && <p className="text-sm leading-relaxed text-zinc-400 whitespace-pre-wrap">{c.content}</p>}
              {c.imageUrl && (
                <a href={c.imageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block">
                  <Image src={c.imageUrl} alt="评论图片" width={240} height={160} className="rounded-lg object-cover" />
                </a>
              )}
              <button onClick={() => isLoggedIn && likeComment(c.id)}
                className={cn(
                  "mt-1.5 flex items-center gap-1 text-[11px] transition-colors",
                  isLoggedIn ? "text-zinc-600 hover:text-pink-400 cursor-pointer" : "text-zinc-700 cursor-default"
                )}>
                <Heart className="h-3 w-3" strokeWidth={1.5} />
                {c.likeCount}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
