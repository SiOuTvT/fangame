"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (form.password !== form.confirm) { setError("两次密码不一致"); return }
    if (form.password.length < 6) { setError("密码至少6位"); return }
    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push("/login?registered=1")
  }

  const fields = [
    { key: "username" as const, icon: User,  type: "text",     placeholder: "用户名" },
    { key: "email"    as const, icon: Mail,  type: "email",    placeholder: "邮箱地址" },
    { key: "password" as const, icon: Lock,  type: "password", placeholder: "密码（至少6位）" },
    { key: "confirm"  as const, icon: CheckCircle2, type: "password", placeholder: "确认密码" },
  ]

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          返回首页
        </Link>

        <div className="rounded-2xl bg-zinc-900 p-8 ring-1 ring-white/[0.06]">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-zinc-100">创建账号</h1>
            <p className="mt-1 text-sm text-zinc-500">加入同人游戏世界</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {fields.map(({ key, icon: Icon, type, placeholder }) => (
              <div key={key} className="flex items-center gap-3 rounded-xl bg-zinc-800 px-4 py-3 ring-1 ring-white/[0.06] focus-within:ring-zinc-600 transition-all">
                <Icon className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} />
                <input
                  type={type}
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  required
                  autoComplete="off"
                  className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="gradient-accent mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
              {loading ? "注册中…" : "注 册"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-zinc-600">
            已有账号？{" "}
            <Link href="/login" className="text-zinc-400 transition-colors hover:text-zinc-200">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
