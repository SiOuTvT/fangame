"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

/**
 * 监听网络状态变化，断网/恢复时自动 toast 提示
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  )

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
      toast.success("网络已恢复", { duration: 2500, icon: "🌐" })
    }
    function handleOffline() {
      setIsOnline(false)
      toast.error("网络连接已断开，部分功能暂时不可用", {
        duration: 8000,
        icon: "📡",
        id: "offline-toast", // 防重复
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return isOnline
}