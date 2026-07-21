# Round 1 Perpetual Review — 修复总结

## 本轮完成（6 项全部落地）

| 编号 | 问题 | 修复方式 | 状态 |
|------|------|----------|------|
| **H1** | 相对时间格式化 4 份实现 | 3 处 `fmtDate` → `timeAgo` (time-ago.ts) | ✅ |
| **H2** | `timeAgoPublished` 死代码 | 激活 + games/[id] 手写替换 | ✅ |
| **H3** | 4 处本地 Avatar (动态 Tailwind 类 bug + 破图) | 新建 `UserAvatar`(SafeAvatar 封装) 替换 | ✅ |
| **H4** | 论坛移动端缺回复/分享/锁定徽标/浏览量 | 补齐: replyTo、share、locked badge、viewCount | ✅ |
| **M1** | 6 份 admin 删除按钮 | 新建 `AdminDeleteButton` 收敛 | ✅ |
| **M2** | 无统一请求层 | 新建 `apiFetch`/`apiDelete` (api.ts) | ✅ |

## 新增文件
- `src/components/user-avatar.tsx` — 统一用户头像组件
- `src/components/admin-delete-button.tsx` — 通用删除按钮
- `src/lib/api.ts` — 统一请求层

## 修改文件（11 个）
- `forum-post-detail.tsx` / `post-detail-modal.tsx` / `forum-post-item.tsx` / `comment-section.tsx`
- `games/[id]/page.tsx`
- `admin/{creators,forum,reports,favorites,follows,checkins}/delete-btn.tsx`

## 验证确认
- `tsc --noEmit`：src 零新增错误（仅 prev admin.ts `unknown` + StorageAdapter 预置问题）
- 全项目复扫：`function fmtDate`、`const Avatar`、`h-\${size}` 均为**零残留**
- 确认零回归

## 待下一轮
1. L5 品牌硬编码色 → CSS 变量
2. 孤儿文件清理扩展到后台 avatar-frame/creator/emotionalMessage
3. 逐步迁移 fetch 到 `apiFetch`/`apiDelete`
4. `EMOJI_CATEGORIES` 与 `EMOJI_LIST` 收敛（低收益）
