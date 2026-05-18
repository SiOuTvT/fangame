"use client"

import { getRandomAvatarColor } from "@/lib/utils"
import { useState } from "react"

/**
 * 带 onError 降级的头像组件
 * 图片加载失败时自动降级为首字母头像
 */
export function SafeAvatar({
  src,
  alt,
  size,
  className,
}: {
  src: string
  alt: string
  size: number
  className?: string
}) {
  const [error, setError] = useState(false)

  const cacheBustedSrc = `${src}${src.includes("?") ? "&" : "?"}t=${Date.now()}`

  if (!src || error) {
    return (
      <div
        className="flex items-center justify-center rounded-full text-white font-bold"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.35,
          backgroundColor: getRandomAvatarColor(alt),
        }}
      >
        {alt[0]?.toUpperCase() || "?"}
      </div>
    )
  }

  return (
    <img
      src={cacheBustedSrc}
      alt={alt}
      className={`object-cover rounded-full ${className || ""}`}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  )
}