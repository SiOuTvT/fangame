import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

/**
 * 全站可配置文案定义
 * key 用于数据库存储，default 是默认值，label 是后台管理界面显示名
 */
export const COPY_ENTRIES = [
  // ── 空状态 ──
  { key: "empty_forum", default: "还没有人发过帖，来开个头吧~", label: "论坛空状态", category: "空状态" },
  { key: "empty_forum_comment", default: "还没有人回复，来说点什么吧~", label: "论坛评论空状态", category: "空状态" },
  { key: "empty_notification", default: "暂时没有新消息~", label: "通知空状态", category: "空状态" },
  { key: "empty_notification_unread", default: "所有消息都看过了~", label: "未读通知空状态", category: "空状态" },
  { key: "empty_resource", default: "还没有人分享资源，等一等~", label: "资源下载空状态", category: "空状态" },
  { key: "empty_comment", default: "还没有评论，来说点什么吧~", label: "评论空状态", category: "空状态" },
  { key: "empty_collection", default: "合集正在筹备中，敬请期待~", label: "合集空状态", category: "空状态" },
  { key: "empty_generic", default: "暂时空空如也~", label: "通用空状态", category: "空状态" },
  { key: "cover_missing", default: "封面还没上传~", label: "封面缺失", category: "空状态" },

  // ── 确认对话框 ──
  { key: "confirm_title", default: "确认一下", label: "确认框标题", category: "确认框" },
  { key: "confirm_desc", default: "确定要这样做吗？", label: "确认框描述", category: "确认框" },
  { key: "confirm_delete_warn", default: "删了就找不回来了。", label: "删除警告", category: "确认框" },

  // ── 错误提示 ──
  { key: "error_send_fail", default: "发送失败了，再试试？", label: "发送失败", category: "错误提示" },
  { key: "error_network", default: "网络好像不太给力，检查一下？", label: "网络错误", category: "错误提示" },
  { key: "error_action_fail", default: "出了点问题，等一下再试试？", label: "操作失败", category: "错误提示" },
  { key: "error_image_too_large", default: "图片太大啦，最多 5MB 哦", label: "图片过大", category: "错误提示" },
  { key: "error_upload_fail", default: "上传失败了，再试试？", label: "上传失败", category: "错误提示" },

  // ── 密码重置 ──
  { key: "reset_sent_title", default: "邮件已发出~", label: "重置邮件发送成功标题", category: "密码重置" },
  { key: "reset_sent_desc", default: "如果这个邮箱注册过，你应该很快就能收到邮件了。", label: "重置邮件发送成功描述", category: "密码重置" },
  { key: "reset_sent_help", default: "没收到？看看垃圾箱，或者联系我们帮忙~", label: "重置邮件帮助文字", category: "密码重置" },
  { key: "reset_expired", default: "链接过期啦", label: "重置链接过期标题", category: "密码重置" },
  { key: "reset_expired_desc", default: "重新申请一个吧~", label: "重置链接过期描述", category: "密码重置" },
  { key: "reset_success", default: "密码重置成功！", label: "重置成功标题", category: "密码重置" },

  // ── 个人资料 ──
  { key: "profile_password_section", default: "修改密码", label: "密码区域标题", category: "个人资料" },
  { key: "profile_password_hint", default: "不想改的话留空就好~", label: "密码区域提示", category: "个人资料" },
  { key: "profile_anonymous", default: "热心网友", label: "匿名用户显示名", category: "个人资料" },
  { key: "profile_lazy_bio", default: "这个人很懒，什么都没留下。", label: "默认个人简介", category: "个人资料" },

  // ── 通知 ──
  { key: "notification_title", default: "消息中心", label: "通知页面标题", category: "通知" },

  // ── 搜索 ──
  { key: "search_result_count", default: "找到 {count} 个结果~", label: "搜索结果计数（{count}会被替换）", category: "搜索" },

  // ── 评论 ──
  { key: "comment_placeholder", default: "写下评论…", label: "评论输入框占位符", category: "评论" },
  { key: "comment_login_prompt", default: "登录后发表评论", label: "未登录评论提示", category: "评论" },
] as const

export type CopyKey = (typeof COPY_ENTRIES)[number]["key"]

/**
 * 获取所有文案覆盖（带缓存）
 */
const getCachedCopyOverrides = unstable_cache(
  async () => {
    const keys = COPY_ENTRIES.map(e => `copy:${e.key}`)
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: keys } },
    })
    const map = new Map(settings.map(s => [s.key.replace("copy:", ""), s.value]))
    return map
  },
  ["copy-overrides"],
  { revalidate: 30, tags: ["copy"] }
)

/**
 * 获取单个文案值（优先使用覆盖值）
 */
export async function getCopy(key: CopyKey): Promise<string> {
  const entry = COPY_ENTRIES.find(e => e.key === key)
  if (!entry) return ""
  const overrides = await getCachedCopyOverrides()
  return overrides.get(key) || entry.default
}

/**
 * 获取所有文案（管理页面用）
 */
export async function getAllCopy(): Promise<Record<CopyKey, string>> {
  const overrides = await getCachedCopyOverrides()
  const result: Record<string, string> = {}
  for (const entry of COPY_ENTRIES) {
    result[entry.key] = overrides.get(entry.key) || entry.default
  }
  return result as Record<CopyKey, string>
}
