"use client"

import { useEffect } from "react"

/**
 * 浏览量计数器 — 仅当用户从列表页点击游戏卡片进入详情页时计数一次。
 * 原理：GameCard 点击时在 sessionStorage 写入 `pending_view_{gameId}` 标记，
 *       此组件挂载后检查标记，存在则调用 API 计数并移除标记。
 *       刷新页面、切换标签等不会重复计数。
 *
 * 优化：使用 Beacon API 异步发送，不阻塞页面；服务器端批量累加。
 */
export function ViewCounter({ gameId }: { gameId: string }) {
  useEffect(() => {
    const key = `pending_view_${gameId}`
    if (!sessionStorage.getItem(key)) return
    sessionStorage.removeItem(key)

    // 使用 sendBeacon 异步发送，不阻塞导航/关闭
    // 服务器端会自动批量累加（Redis 缓冲 + 定期写入 DB）
    const payload = JSON.stringify({ gameId, ts: Date.now() })
    navigator.sendBeacon(`/api/games/${gameId}/view`, payload)
  }, [gameId])

  return null
}