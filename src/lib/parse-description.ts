/**
 * 多语言简介解析工具
 *
 * 数据格式（存储在 Game.description 字段）：
 * - 旧格式：纯文本字符串（向后兼容，视为中文简介）
 * - 新格式：JSON 字符串 { zh, en, ja, other }
 */

export interface LocalizedDescription {
  zh: string
  en: string
  ja: string
  other: string
}

/** 语言选项定义 */
export const DESCRIPTION_LANGUAGES = [
  { key: "zh" as const, label: "中文简介", flag: "🇨🇳" },
  { key: "en" as const, label: "English", flag: "🇬🇧" },
  { key: "ja" as const, label: "日本語", flag: "🇯🇵" },
  { key: "other" as const, label: "其他语言", flag: "🌐" },
] as const

export type LangKey = (typeof DESCRIPTION_LANGUAGES)[number]["key"]

/**
 * 从数据库原始值解析为结构化多语言简介
 * 向后兼容旧的纯文本格式
 */
export function parseDescription(raw: string | null | undefined): LocalizedDescription {
  const empty: LocalizedDescription = { zh: "", en: "", ja: "", other: "" }
  if (!raw) return empty

  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === "object" && parsed !== null && ("zh" in parsed || "en" in parsed || "ja" in parsed || "other" in parsed)) {
      return {
        zh: typeof parsed.zh === "string" ? parsed.zh : "",
        en: typeof parsed.en === "string" ? parsed.en : "",
        ja: typeof parsed.ja === "string" ? parsed.ja : "",
        other: typeof parsed.other === "string" ? parsed.other : "",
      }
    }
    // JSON 但不是多语言格式 → 视为旧数据，放到中文
    return { ...empty, zh: raw }
  } catch {
    // 非 JSON → 纯文本旧格式，视为中文
    return { ...empty, zh: raw }
  }
}

/**
 * 将结构化多语言简介序列化为数据库存储格式
 * 如果所有语言字段都为空则存空字符串
 */
export function serializeDescription(desc: LocalizedDescription): string {
  const hasAny = desc.zh || desc.en || desc.ja || desc.other
  if (!hasAny) return ""
  // 如果只有中文有内容，仍存 JSON 以保持一致
  return JSON.stringify(desc)
}

/**
 * 按优先级获取简介文本
 * 优先级：中文 > 英文 > 日文 > 其他
 */
export function getDescriptionText(raw: string | null | undefined): string {
  const desc = parseDescription(raw)
  return desc.zh || desc.en || desc.ja || desc.other || ""
}

/**
 * 获取简介对应的语言标签（用于前台显示"来源语言"标记）
 */
export function getDescriptionLang(raw: string | null | undefined): string | null {
  const desc = parseDescription(raw)
  if (desc.zh) return "中文"
  if (desc.en) return "English"
  if (desc.ja) return "日本語"
  if (desc.other) return "其他"
  return null
}

/**
 * 获取所有非空的语言简介列表（用于前台展示所有可用语言）
 * 返回格式：[{ lang: "zh", label: "中文", text: "..." }, ...]
 */
export function getAllDescriptions(raw: string | null | undefined): { lang: string; label: string; text: string }[] {
  const desc = parseDescription(raw)
  const result: { lang: string; label: string; text: string }[] = []
  if (desc.zh) result.push({ lang: "zh", label: "中文", text: desc.zh })
  if (desc.en) result.push({ lang: "en", label: "English", text: desc.en })
  if (desc.ja) result.push({ lang: "ja", label: "日本語", text: desc.ja })
  if (desc.other) result.push({ lang: "other", label: "其他", text: desc.other })
  return result
}
