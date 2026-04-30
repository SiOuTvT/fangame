"use client"

import { useState } from "react"
import Image from "next/image"
import { MessageSquare, Heart, Plus, X, Send, ChevronLeft, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ForumUser { id: string; username: string; avatar: string }
interface Post {
  id: string; title: string; content: string; imageUrl: string
  likeCount: number; isSolved: boolean; createdAt: string
  user: ForumUser; commentCount: number
}
interface Comment {
  id: string; content: string; imageUrl: string
  likeCount: number; createdAt: string; user: ForumUser
}

function Avatar({ user, size = 8 }: { user: ForumUser; size?: number }) {
  if (user.avatar) return <Image src={user.avatar} alt={user.username} width={size * 4} height={size * 4} className={`h-${size} w-${size} rounded-full object-cover`} />
  return (
    <div className={`flex h-${size} w-${size} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-[11px] font-bold text-white`}>
      {user.username[0].toUpperCase()}
    </div>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

const FILTER_TABS = [
  { key: "all",      label: "全部" },
  { key: "unsolved", label: "未解决" },
  { key: "solved",   label: "已解决" },
]

export function ForumClient({ initialPosts, isLoggedIn, currentUser }: {
  initialPosts: Post[]
  isLoggedIn: boolean
  currentUser: { id: string; name: string; image: string } | null
}) {
  const [posts, setPosts]           = useState(initialPosts)
  const [filter, setFilter]         = useState("all")
  const [activePost, setActivePost] = useState<(Post & { comments: Comment[] }) | null>(null)
  const [loadingPost, setLoadingPost] = useState(false)
  const [showNew, setShowNew]       = useState(false)
  const [newTitle, setNewTitle]     = useState("")
  const [newContent, setNewContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [commentText, setCommentText] = useState("")

  const filteredPosts = posts.filter(p => {
    if (filter === "solved")   return p.isSolved
    if (filter === "unsolved") return !p.isSolved
    return true
  })

  async function openPost(id: string) {
    setLoadingPost(true); setActivePost(null)
    const res  = await fetch(`/api/forum/posts/${id}`)
    const data = await res.json()
    setActivePost(data); setLoadingPost(false)
  }

  async function likePost(id: string) {
    if (!isLoggedIn) return
    const res  = await fetch(`/api/forum/posts/${id}/like`, { method: "POST" })
    const data = await res.json()
    setPosts(p => p.map(x => x.id === id ? { ...x, likeCount: data.likeCount } : x))
    if (activePost?.id === id) setActivePost(p => p && { ...p, likeCount: data.likeCount })
  }

  async function toggleSolve(id: string) {
    const res  = await fetch(`/api/forum/posts/${id}/solve`, { method: "POST" })
    const data = await res.json()
    if (res.ok) {
      setPosts(p => p.map(x => x.id === id ? { ...x, isSolved: data.isSolved } : x))
      if (activePost?.id === id) setActivePost(p => p && { ...p, isSolved: data.isSolved })
    }
  }

  async function likeComment(id: string) {
    if (!isLoggedIn) return
    const res  = await fetch(`/api/forum/comments/${id}/like`, { method: "POST" })
    const data = await res.json()
    setActivePost(p => p && { ...p, comments: p.comments.map(c => c.id === id ? { ...c, likeCount: data.likeCount } : c) })
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return
    setSubmitting(true)
    const fd = new FormData()
    fd.append("title", newTitle.trim()); fd.append("content", newContent.trim())
    const res  = await fetch("/api/forum/posts", { method: "POST", body: fd })
    const data = await res.json()
    if (res.ok) { setPosts(p => [data, ...p]); setShowNew(false); setNewTitle(""); setNewContent("") }
    setSubmitting(false)
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || !activePost) return
    const fd = new FormData()
    fd.append("content", commentText.trim())
    const res  = await fetch(`/api/forum/posts/${activePost.id}/comments`, { method: "POST", body: fd })
    const data = await res.json()
    if (res.ok) { setActivePost(p => p && { ...p, comments: [...p.comments, data] }); setCommentText("") }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* 页头 */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-zinc-100">求档 · 论坛</h1>
          <p className="mt-0.5 text-xs text-zinc-500">找不到资源？发帖求档，社区互助</p>
        </div>
        {isLoggedIn && (
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 ring-1 ring-white/[0.06] transition-all hover:bg-zinc-700 hover:text-white">
            <Plus className="h-4 w-4" strokeWidth={1.5} />发帖
          </button>
        )}
      </div>

      {/* 筛选 tab */}
      <div className="mb-4 flex gap-1">
        {FILTER_TABS.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              filter === tab.key ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
            )}>
            {tab.label}
            <span className="ml-1.5 text-[10px] text-zinc-600">
              {tab.key === "all" ? posts.length : tab.key === "solved" ? posts.filter(p => p.isSolved).length : posts.filter(p => !p.isSolved).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.4fr]">
        {/* 左：帖子列表 */}
        <div className="space-y-2">
          {filteredPosts.length === 0 && (
            <p className="py-16 text-center text-sm text-zinc-600">暂无帖子</p>
          )}
          {filteredPosts.map(post => (
            <button key={post.id} onClick={() => openPost(post.id)}
              className={cn(
                "w-full rounded-xl bg-zinc-900 p-4 text-left ring-1 transition-all hover:bg-zinc-800",
                activePost?.id === post.id ? "ring-zinc-600" : "ring-white/[0.06] hover:ring-white/10"
              )}>
              <div className="mb-2 flex items-center gap-2">
                <Avatar user={post.user} size={6} />
                <span className="text-xs text-zinc-500">{post.user.username}</span>
                {post.isSolved && (
                  <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                    <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2} />已解决
                  </span>
                )}
                <span className="ml-auto text-[10px] text-zinc-600">{fmtDate(post.createdAt)}</span>
              </div>
              <p className="line-clamp-2 text-sm font-medium text-zinc-200">{post.title}</p>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-600">
                <span className="flex items-center gap-1"><Heart className="h-3 w-3" strokeWidth={1.5} />{post.likeCount}</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" strokeWidth={1.5} />{post.commentCount}</span>
              </div>
            </button>
          ))}
        </div>

        {/* 右：帖子详情 */}
        <div className="hidden md:block">
          {loadingPost && (
            <div className="flex h-64 items-center justify-center rounded-2xl bg-zinc-900 ring-1 ring-white/[0.06]">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
            </div>
          )}
          {!loadingPost && !activePost && (
            <div className="flex h-64 items-center justify-center rounded-2xl bg-zinc-900 ring-1 ring-white/[0.06]">
              <p className="text-sm text-zinc-600">点击左侧帖子查看详情</p>
            </div>
          )}
          {!loadingPost && activePost && (
            <PostDetail post={activePost} isLoggedIn={isLoggedIn} currentUserId={currentUser?.id}
              commentText={commentText} setCommentText={setCommentText}
              onLikePost={() => likePost(activePost.id)}
              onLikeComment={likeComment} onSubmitComment={submitComment}
              onToggleSolve={() => toggleSolve(activePost.id)} />
          )}
        </div>
      </div>

      {/* 移动端全屏 */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 md:hidden">
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
            <button onClick={() => setActivePost(null)} className="text-zinc-400 hover:text-zinc-200">
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <span className="flex-1 text-sm font-medium text-zinc-200 line-clamp-1">{activePost.title}</span>
            {activePost.isSolved && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={1.5} />}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <PostDetail post={activePost} isLoggedIn={isLoggedIn} currentUserId={currentUser?.id}
              commentText={commentText} setCommentText={setCommentText}
              onLikePost={() => likePost(activePost.id)}
              onLikeComment={likeComment} onSubmitComment={submitComment}
              onToggleSolve={() => toggleSolve(activePost.id)} />
          </div>
        </div>
      )}

      {/* 发帖弹窗 */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 ring-1 ring-white/[0.06]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-100">发布新帖</h2>
              <button onClick={() => setShowNew(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <form onSubmit={submitPost} className="space-y-3">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                placeholder="标题（如：求《xxx》下载地址）" maxLength={100} required
                className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 ring-1 ring-white/[0.06] outline-none focus:ring-zinc-600 transition-all" />
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)}
                placeholder="详细描述你的需求…" rows={5} required
                className="w-full resize-none rounded-xl bg-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 ring-1 ring-white/[0.06] outline-none focus:ring-zinc-600 transition-all" />
              <button type="submit" disabled={submitting}
                className="gradient-accent w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60">
                {submitting ? "发布中…" : "发 布"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function PostDetail({ post, isLoggedIn, currentUserId, commentText, setCommentText, onLikePost, onLikeComment, onSubmitComment, onToggleSolve }: {
  post: Post & { comments: Comment[] }
  isLoggedIn: boolean
  currentUserId?: string
  commentText: string
  setCommentText: (v: string) => void
  onLikePost: () => void
  onLikeComment: (id: string) => void
  onSubmitComment: (e: React.FormEvent) => void
  onToggleSolve: () => void
}) {
  const isAuthor = currentUserId === post.user.id

  return (
    <div className="rounded-2xl bg-zinc-900 ring-1 ring-white/[0.06] overflow-hidden">
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2.5">
          <Avatar user={post.user} size={8} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200">{post.user.username}</p>
            <p className="text-[10px] text-zinc-600">{fmtDate(post.createdAt)}</p>
          </div>
          {post.isSolved && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" strokeWidth={2} />已解决
            </span>
          )}
        </div>

        <h2 className="mb-2 text-base font-bold text-zinc-100">{post.title}</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">{post.content}</p>
        {post.imageUrl && <Image src={post.imageUrl} alt="" width={480} height={320} className="mt-3 rounded-xl object-cover" />}

        <div className="mt-4 flex items-center gap-2">
          <button onClick={onLikePost} disabled={!isLoggedIn}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 ring-1 ring-white/[0.06] transition-all hover:text-pink-400 disabled:opacity-40">
            <Heart className="h-3.5 w-3.5" strokeWidth={1.5} />{post.likeCount}
          </button>
          {isAuthor && (
            <button onClick={onToggleSolve}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ring-1 transition-all",
                post.isSolved
                  ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 hover:bg-emerald-500/20"
                  : "bg-zinc-800 text-zinc-400 ring-white/[0.06] hover:text-emerald-400"
              )}>
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              {post.isSolved ? "取消已解决" : "标记已解决"}
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-white/[0.06] p-5">
        <p className="mb-3 text-xs font-semibold text-zinc-500">评论 {post.comments.length}</p>
        <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
          {post.comments.length === 0 && <p className="text-xs text-zinc-600">还没有评论~</p>}
          {post.comments.map(c => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar user={c.user} size={6} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-zinc-300">{c.user.username}</span>
                  <span className="text-[10px] text-zinc-600">{fmtDate(c.createdAt)}</span>
                </div>
                <p className="text-xs leading-relaxed text-zinc-400">{c.content}</p>
                <button onClick={() => onLikeComment(c.id)} disabled={!isLoggedIn}
                  className="mt-1 flex items-center gap-1 text-[10px] text-zinc-600 transition-colors hover:text-pink-400 disabled:opacity-40">
                  <Heart className="h-2.5 w-2.5" strokeWidth={1.5} />{c.likeCount}
                </button>
              </div>
            </div>
          ))}
        </div>
        {isLoggedIn ? (
          <form onSubmit={onSubmitComment} className="flex gap-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="写下评论…"
              className="flex-1 rounded-xl bg-zinc-800 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 ring-1 ring-white/[0.06] outline-none focus:ring-zinc-600 transition-all" />
            <button type="submit" className="flex items-center gap-1 rounded-xl bg-zinc-800 px-3 py-2 text-xs text-zinc-400 ring-1 ring-white/[0.06] transition-all hover:text-zinc-200">
              <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </form>
        ) : (
          <p className="text-xs text-zinc-600"><a href="/login" className="text-pink-400 hover:text-pink-300">登录</a>后发表评论</p>
        )}
      </div>
    </div>
  )
}
