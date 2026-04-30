"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search")
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 rounded-2xl bg-zinc-900 px-4 py-3 ring-1 ring-white/[0.06] transition-all focus-within:ring-zinc-600">
        <Search className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="搜索游戏名称、原作、标签…"
          autoFocus
          className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => { setValue(""); inputRef.current?.focus() }}
            className="text-zinc-600 transition-colors hover:text-zinc-400"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
        <button
          type="submit"
          className="rounded-xl bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 ring-1 ring-white/[0.06] transition-all hover:bg-zinc-700 hover:text-zinc-200"
        >
          搜索
        </button>
      </div>
    </form>
  )
}
