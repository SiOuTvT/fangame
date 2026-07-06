"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { logger } from "@/lib/logger"

interface UseAutoSaveDraftOptions<T> {
  /** localStorage key */
  key: string
  /** 防抖延迟（毫秒），默认 2000 */
  debounceMs?: number
  /** 初始值（当没有已保存的草稿时使用） */
  defaultValue: T
  /** 是否启用，默认 true */
  enabled?: boolean
}

interface UseAutoSaveDraftReturn<T> {
  /** 当前草稿数据 */
  draft: T
  /** 更新草稿（会自动防抖保存） */
  updateDraft: (data: T) => void
  /** 是否有已恢复的草稿 */
  hasRestored: boolean
  /** 清除草稿 */
  clearDraft: () => void
  /** 手动保存 */
  saveNow: () => void
}

/**
 * 表单自动保存到 localStorage
 *
 * 用法：
 *   const { draft, updateDraft, hasRestored, clearDraft } = useAutoSaveDraft({
 *     key: "game-form-draft",
 *     defaultValue: { title: "", description: "" },
 *   })
 */
export function useAutoSaveDraft<T>({
  key,
  debounceMs = 2000,
  defaultValue,
  enabled = true,
}: UseAutoSaveDraftOptions<T>): UseAutoSaveDraftReturn<T> {
  const storageKey = `draft:${key}`

  // 从 localStorage 恢复
  const [draft, setDraft] = useState<T>(() => {
    if (!enabled || typeof window === "undefined") return defaultValue
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...defaultValue, ...parsed }
      }
    } catch (err) {
      logger.api.warn("[useAutoSaveDraft] restore draft failed", { error: err instanceof Error ? err.message : String(err) })
    }
    return defaultValue
  })

  const [hasRestored, setHasRestored] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const latestRef = useRef<T>(draft)

  // 首次挂载检测是否有恢复的草稿
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        setHasRestored(true)
      }
    } catch (err) {
      logger.api.warn("[useAutoSaveDraft] check restored draft failed", { error: err instanceof Error ? err.message : String(err) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 保存到 localStorage
  const saveToStorage = useCallback(
    (data: T) => {
      if (!enabled || typeof window === "undefined") return
      try {
        localStorage.setItem(storageKey, JSON.stringify(data))
      } catch (err) {
        logger.api.warn("[useAutoSaveDraft] save to localStorage failed", { error: err instanceof Error ? err.message : String(err) })
      }
    },
    [enabled, storageKey],
  )

  // 防抖保存
  const updateDraft = useCallback(
    (data: T) => {
      setDraft(data)
      latestRef.current = data

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        saveToStorage(latestRef.current)
      }, debounceMs)
    },
    [debounceMs, saveToStorage],
  )

  // 手动保存
  const saveNow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    saveToStorage(latestRef.current)
  }, [saveToStorage])

  // 清除草稿
  const clearDraft = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setDraft(defaultValue)
    latestRef.current = defaultValue
    setHasRestored(false)
    try {
      localStorage.removeItem(storageKey)
    } catch (err) {
      logger.api.warn("[useAutoSaveDraft] remove draft failed", { error: err instanceof Error ? err.message : String(err) })
    }
  }, [defaultValue, storageKey])

  // 页面离开前保存
  useEffect(() => {
    if (!enabled) return
    const handleBeforeUnload = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      saveToStorage(latestRef.current)
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [enabled, saveToStorage])

  return { draft, updateDraft, hasRestored, clearDraft, saveNow }
}