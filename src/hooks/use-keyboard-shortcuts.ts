"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * P4-2: 全局键盘快捷键
 * - Ctrl/Cmd + K → 聚焦搜索框
 * - Escape → 关闭当前 dialog/回到上一页
 */
export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey

      // Ctrl/Cmd + K → 聚焦搜索框
      if (isMod && e.key === "k") {
        e.preventDefault()
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[placeholder*="搜索"], input[name="q"]'
        )
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        } else {
          // 如果当前页面没有搜索框，跳转到搜索页
          router.push("/search")
        }
        return
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [router])
}