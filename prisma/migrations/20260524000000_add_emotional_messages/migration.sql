-- CreateTable
CREATE TABLE "EmotionalMessage" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "emoji" TEXT NOT NULL DEFAULT '',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmotionalMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmotionalMessage_key_key" ON "EmotionalMessage"("key");

-- CreateIndex
CREATE INDEX "EmotionalMessage_category_idx" ON "EmotionalMessage"("category");

-- CreateIndex
CREATE INDEX "EmotionalMessage_key_idx" ON "EmotionalMessage"("key");

-- SeedData: 默认情感化消息
INSERT INTO "EmotionalMessage" ("id", "key", "category", "title", "subtitle", "emoji", "enabled", "updatedAt") VALUES
('em_toast_fav_add', 'favorite_added', 'toast', '收藏成功 ❤️', '已加入你的收藏夹', '❤️', true, CURRENT_TIMESTAMP),
('em_toast_fav_rm', 'favorite_removed', 'toast', '取消收藏', '已从收藏夹移除', '💔', true, CURRENT_TIMESTAMP),
('em_toast_checkin', 'checkin_success', 'toast', '签到成功！', '今天也要开心哦～', '✅', true, CURRENT_TIMESTAMP),
('em_toast_checkin_dup', 'checkin_duplicate', 'toast', '已签到过啦', '明天再来吧', '⏳', true, CURRENT_TIMESTAMP),
('em_toast_follow', 'follow_success', 'toast', '关注成功', '不错过 TA 的动态', '🔔', true, CURRENT_TIMESTAMP),
('em_toast_unfollow', 'unfollow_success', 'toast', '取消关注', '已取消关注', '🔕', true, CURRENT_TIMESTAMP),
('em_toast_comment', 'comment_success', 'toast', '评论发布成功', '感谢你的分享～', '💬', true, CURRENT_TIMESTAMP),
('em_toast_vote', 'vote_success', 'toast', '投票成功', '感谢你的参与', '🗳️', true, CURRENT_TIMESTAMP),
('em_toast_rating', 'rating_success', 'toast', '评分成功', '感谢你的评价', '⭐', true, CURRENT_TIMESTAMP),
('em_toast_report', 'report_success', 'toast', '举报已提交', '我们会尽快处理', '📢', true, CURRENT_TIMESTAMP),
('em_empty_fav', 'empty_favorites', 'empty', '还没有收藏', '去发现喜欢的游戏吧', '💫', true, CURRENT_TIMESTAMP),
('em_empty_comment', 'empty_comments', 'empty', '暂无评论', '来说点什么吧', '💬', true, CURRENT_TIMESTAMP),
('em_empty_search', 'empty_search', 'empty', '没有找到结果', '换个关键词试试？', '🔍', true, CURRENT_TIMESTAMP),
('em_empty_forum', 'empty_forum', 'empty', '还没有帖子', '来发起第一个话题吧', '📝', true, CURRENT_TIMESTAMP),
('em_empty_checkin', 'empty_checkins', 'empty', '还没有签到记录', '每天签到获取积分', '📅', true, CURRENT_TIMESTAMP),
('em_empty_following', 'empty_following', 'empty', '还没有关注任何人', '去发现有趣的创作者吧', '👥', true, CURRENT_TIMESTAMP),
('em_empty_followers', 'empty_followers', 'empty', '还没有粉丝', '分享内容吸引更多关注', '🌟', true, CURRENT_TIMESTAMP),
('em_empty_notif', 'empty_notifications', 'empty', '没有新通知', '一切都好～', '🔔', true, CURRENT_TIMESTAMP),
('em_empty_status', 'empty_play_status', 'empty', '还没有游玩记录', '开始你的游戏之旅吧', '🎮', true, CURRENT_TIMESTAMP),
('em_err_404', 'error_404', 'error', '页面走丢了', '你访问的页面不存在', '🌌', true, CURRENT_TIMESTAMP),
('em_err_500', 'error_500', 'error', '服务器开小差了', '请稍后再试', '⚠️', true, CURRENT_TIMESTAMP),
('em_err_net', 'error_network', 'error', '网络连接失败', '请检查你的网络', '📡', true, CURRENT_TIMESTAMP),
('em_err_unauth', 'error_unauthorized', 'error', '未登录', '请先登录后再操作', '🔒', true, CURRENT_TIMESTAMP),
('em_success_reg', 'success_register', 'success', '注册成功 🎉', '欢迎加入！', '🎉', true, CURRENT_TIMESTAMP),
('em_success_profile', 'success_profile', 'success', '资料更新成功', '你的个人信息已保存', '✨', true, CURRENT_TIMESTAMP);