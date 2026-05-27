import { useEffect } from "react"

/**
 * 当组件挂载时锁定 body 滚动，卸载时恢复。
 * 防止弹窗/模态框背后的页面滚动。
 * 使用 scrollbar-gutter: stable 防止弹窗打开/关闭时页面内容偏移。
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const body = document.body
    const prevOverflow = body.style.overflow
    const prevGutter = body.style.scrollbarGutter

    body.style.overflow = "hidden"
    body.style.scrollbarGutter = "stable"

    return () => {
      body.style.overflow = prevOverflow
      body.style.scrollbarGutter = prevGutter
    }
  }, [active])
}