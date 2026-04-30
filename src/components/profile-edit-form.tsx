"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { User, FileText, Loader2, ArrowLeft, Camera, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Props {
  user: { id: string; username: string; bio: string; avatar: string; banner: string }
}

export function ProfileEditForm({ user }: Props) {
  const router = useRouter()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [username, setUsername]     = useState(user.username)
  const [bio, setBio]               = useState(user.bio)
  const [avatarUrl, setAvatarUrl]   = useState(user.avatar)
  const [avatarPreview, setAvatarPreview] = useState(user.avatar)
  const [oldPassword, setOldPassword]   = useState("")
  const [newPassword, setNewPassword]   = useState("")
  const [showOld, setShowOld]       = useState(false)
  const [showNew, setShowNew]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState("")
  const [success, setSuccess]       = useState("")

  // 头像本地预览（上传前）
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // 头像：选择后直接用 base64 存储，不依赖外部上传服务
  async function uploadAvatar(): Promise<string | null> {
    const file = avatarInputRef.current?.files?.[0]
    if (!file) return avatarUrl

    // 限制 2MB
    if (file.size > 2 * 1024 * 1024) {
      setError("头像图片不能超过 2MB")
      return avatarUrl
    }

    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (ev) => resolve(ev.target?.result as string ?? avatarUrl)
      reader.onerror = () => resolve(avatarUrl)
      reader.readAsDataURL(file)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword && newPassword.length < 6) {
      setError("新密码至少6位")
      return
    }

    setSaving(true)
    const finalAvatar = await uploadAvatar()

    const res = await fetch("/api/profile/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.trim(),
        bio: bio.trim(),
        avatar: finalAvatar,
        oldPassword: oldPassword || undefined,
        newPassword: newPassword || undefined,
      }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error); return }
    setSuccess("保存成功！")
    setAvatarUrl(finalAvatar ?? "")
    setOldPassword("")
    setNewPassword("")
    setTimeout(() => router.push(`/profile/${user.id}`), 800)
  }

  const inputCls = "flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
  const fieldCls = "flex items-center gap-3 rounded-xl bg-zinc-800 px-4 py-3 ring-1 ring-white/[0.06] focus-within:ring-zinc-600 transition-all"

  return (
    <div className="rounded-2xl bg-zinc-900 p-6 ring-1 ring-white/[0.06]">
      <Link href={`/profile/${user.id}`} className="mb-5 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />返回主页
      </Link>

      {error   && <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400 ring-1 ring-emerald-500/20">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 头像上传 */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-pink-500 to-purple-500 ring-2 ring-white/10">
              {avatarPreview
                ? <img src={avatarPreview} alt="头像" className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white">{username[0]?.toUpperCase()}</div>
              }
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 ring-2 ring-zinc-900 transition-colors hover:bg-zinc-600"
            >
              <Camera className="h-3 w-3 text-zinc-300" strokeWidth={1.5} />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300">头像</p>
            <p className="text-xs text-zinc-600">点击相机图标上传，支持 JPG/PNG/WebP，最大 2MB</p>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        {/* 用户名 */}
        <div className={fieldCls}>
          <User className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} />
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="用户名" maxLength={20} required className={inputCls} />
        </div>

        {/* 简介 */}
        <div className="flex gap-3 rounded-xl bg-zinc-800 px-4 py-3 ring-1 ring-white/[0.06] focus-within:ring-zinc-600 transition-all">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} />
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="个人简介（选填）" maxLength={200} rows={3} className="flex-1 resize-none bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none" />
        </div>

        {/* 修改密码 */}
        <div className="space-y-2 rounded-xl bg-zinc-800/50 p-4 ring-1 ring-white/[0.04]">
          <p className="text-xs font-medium text-zinc-500">修改密码（不修改留空）</p>
          <div className={fieldCls}>
            <Lock className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} />
            <input type={showOld ? "text" : "password"} value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="当前密码" className={inputCls} />
            <button type="button" onClick={() => setShowOld(v => !v)} className="text-zinc-600 hover:text-zinc-400">
              {showOld ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </div>
          <div className={fieldCls}>
            <Lock className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} />
            <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="新密码（至少6位）" className={inputCls} />
            <button type="button" onClick={() => setShowNew(v => !v)} className="text-zinc-600 hover:text-zinc-400">
              {showNew ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="gradient-accent flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60">
          {(saving) && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
          {saving ? "保存中…" : "保存修改"}
        </button>
      </form>
    </div>
  )
}
