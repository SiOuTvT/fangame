import { prisma } from "./prisma"

/** 服务端获取单条情感消息（通过 key） */
export async function getEmotionalMessage(key: string) {
  return prisma.emotionalMessage.findFirst({ where: { key, enabled: true } })
}

/** 服务端获取某分类下所有已启用的情感消息 */
export async function getEmotionalMessagesByCategory(category: string) {
  return prisma.emotionalMessage.findMany({
    where: { category, enabled: true },
    orderBy: { key: "asc" },
  })
}

/** 预定义情感消息 key 常量，方便代码引用 */
export const EM_KEYS = {
  // Toast
  FAVORITE_ADDED: "favorite_added",
  FAVORITE_REMOVED: "favorite_removed",
  CHECKIN_SUCCESS: "checkin_success",
  CHECKIN_DUPLICATE: "checkin_duplicate",
  FOLLOW_SUCCESS: "follow_success",
  UNFOLLOW_SUCCESS: "unfollow_success",
  COMMENT_SUCCESS: "comment_success",
  VOTE_SUCCESS: "vote_success",
  RATING_SUCCESS: "rating_success",
  REPORT_SUCCESS: "report_success",
  // Empty
  EMPTY_FAVORITES: "empty_favorites",
  EMPTY_COMMENTS: "empty_comments",
  EMPTY_SEARCH: "empty_search",
  EMPTY_FORUM: "empty_forum",
  EMPTY_CHECKINS: "empty_checkins",
  EMPTY_FOLLOWING: "empty_following",
  EMPTY_FOLLOWERS: "empty_followers",
  EMPTY_NOTIFICATIONS: "empty_notifications",
  EMPTY_PLAY_STATUS: "empty_play_status",
  // Error
  ERROR_404: "error_404",
  ERROR_500: "error_500",
  ERROR_NETWORK: "error_network",
  ERROR_UNAUTHORIZED: "error_unauthorized",
  // Success
  SUCCESS_REGISTER: "success_register",
  SUCCESS_PROFILE: "success_profile",
} as const

/** 客户端 fetch 辅助（SWR/React Query 不需要时可直接用此函数） */
export async function fetchEmotionalMessage(key: string) {
  const res = await fetch(`/api/emotional-messages?key=${encodeURIComponent(key)}`)
  if (!res.ok) return null
  return res.json()
}

/** 批量获取客户端 */
export async function fetchEmotionalMessages(category?: string) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : ""
  const res = await fetch(`/api/emotional-messages${qs}`)
  if (!res.ok) return []
  return res.json()
}