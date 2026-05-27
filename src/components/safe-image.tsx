"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"

/**
 * Next.js Image 的客户端包装
 * 加载失败时自动降级为占位图（带图标 + 文字）
 */
export function SafeImage(props: ImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    const fallbackStyle: React.CSSProperties = {
      ...(props.fill
        ? { position: "absolute" as const, inset: 0, width: "100%", height: "100%" }
        : { width: props.width ?? "100%", height: props.height ?? "100%" }),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      background: "hsl(var(--muted))",
      color: "hsl(var(--muted-foreground))",
      fontSize: 14,
      borderRadius: "inherit",
    }

    return (
      <div style={fallbackStyle}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.4}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span>图片加载失败</span>
      </div>
    )
  }

  return <Image {...props} onError={() => setError(true)} />
}