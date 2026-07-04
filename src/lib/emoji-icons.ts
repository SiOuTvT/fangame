import {
  Heart, HeartOff, CheckCircle, FileText, Bell, Gamepad2, PartyPopper, Sparkles,
  Search, Link as LinkIcon, Folder, Download, AlertTriangle, Clock,
  HelpCircle, Upload, Lightbulb, Flame, Eye, BookmarkPlus, BookmarkMinus,
  MessageCircle, Pin, Save, ClipboardList, XCircle, Star, ThumbsUp,
  ThumbsDown, Music, Zap, Award, Sun, UserPlus, UserMinus, Compass,
  ServerCrash, WifiOff, Lock, Unlock, Key, Package, BookOpen, Inbox,
  Image, Mail, LogIn, Trophy, Map, User,
} from "lucide-react"
import type { ComponentType, SVGProps } from "react"

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

/**
 * Lucide icon name → 组件映射
 * 情感消息的 emoji 字段现在存储 Lucide icon name（如 "Heart", "Search"）
 */
const ICON_NAME_MAP: Record<string, IconComponent> = {
  Heart, HeartOff, CheckCircle, FileText, Bell, Gamepad2, PartyPopper, Sparkles,
  Search, Link: LinkIcon, Folder, Download, AlertTriangle, Clock,
  HelpCircle, Upload, Lightbulb, Flame, Eye, BookmarkPlus, BookmarkMinus,
  MessageCircle, Pin, Save, ClipboardList, XCircle, Star, ThumbsUp,
  ThumbsDown, Music, Zap, Award, Sun, UserPlus, UserMinus, Compass,
  ServerCrash, WifiOff, Lock, Unlock, Key, Package, BookOpen, Inbox,
  Image, Mail, LogIn, Trophy, Map, User,
}

/**
 * 根据 icon name 获取 Lucide 图标组件
 * 支持 Lucide icon name（如 "Heart"）和旧版 emoji 字符串（如 "❤️"）
 * 如果没有映射，返回 null
 */
export function getIconForEmoji(emoji: string): IconComponent | null {
  return ICON_NAME_MAP[emoji] ?? null
}

/**
 * 导出可用的 icon name 列表供 admin 管理界面使用
 */
export const EMOJI_OPTIONS = Object.keys(ICON_NAME_MAP)
