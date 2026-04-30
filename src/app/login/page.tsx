"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { User, Lock, ArrowLeft, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await signIn("credentials", { identifier, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError("账号或密码错误")
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          返回首页
        </Link>

        <div className="rounded-2xl bg-zinc-900 p-8 ring-1 ring-white/[0.06]">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-zinc-100">欢迎回来</h1>
            <p className="mt-1 text-sm text-zinc-500">登录以继续探索</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-zinc-800 px-4 py-3 ring-1 ring-white/[0.06] focus-within:ring-zinc-600 transition-all">
              <User className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="用户名或邮箱"
                required
                autoComplete="off"
                className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-zinc-800 px-4 py-3 ring-1 ring-white/[0.06] focus-within:ring-zinc-600 transition-all">
              <Lock className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                required
                className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gradient-accent mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
              {loading ? "登录中…" : "登 录"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-zinc-600">
            还没有账号？{" "}
            <Link href="/register" className="text-zinc-400 transition-colors hover:text-zinc-200">
              立即注册
            </Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link href="/forgot-password" className="text-zinc-600 transition-colors hover:text-zinc-400">
              忘记密码？
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
