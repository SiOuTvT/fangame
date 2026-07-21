"use client"

import { SafeAvatar } from "@/components/safe-avatar"

/**
 * 用户头像组件（统一封装 SafeAvatar）
 *
 * 消除论坛/评论 4 处本地 Avatar 定义（H3）：
 * - 论坛组件使用了动态 Tailwind 类 `h-${size} w-${size}` —— Tailwind 编译期无法生成尺寸，导致尺寸错误
 * - 本地 Avatar 均缺少 onError 降级，头像 URL 失效即破图
 * - 尺寸签名不一致（string/number/无参数）
 */
export function UserAvatar({
  user,
  size = 32,
  className,
}: {
  user: { username: string; avatar?: string | null }
  size?: number
  className?: string
}) {
  return <SafeAvatar src={user.avatar ?? ""} alt={user.username} size={size} className={className} />
}
