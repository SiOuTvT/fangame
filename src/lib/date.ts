/**
 * 统一时区工具（Single Source of Truth）
 *
 * 全站所有"按天"的比较、分组、连续计算，一律以 Asia/Shanghai 为准。
 * 禁止在逻辑代码中混用 toISOString()(UTC) 与 toLocaleDateString(Shanghai)，
 * 否则会因服务器时区不同而产生跨日偏差（M5 / M18）。
 */

const SHANGHAI_TZ = "Asia/Shanghai"

/** 将任意时间转换为 Asia/Shanghai 的 YYYY-MM-DD 字符串 */
export function toShanghaiDate(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input)
  return d.toLocaleDateString("sv-SE", { timeZone: SHANGHAI_TZ })
}

/** 在 Shanghai 日历日基础上平移若干天，返回新的 YYYY-MM-DD 字符串 */
export function shiftShanghaiDate(dateStr: string, days: number): string {
  // 以 Shanghai 当天 00:00 为基准，避免被本地时区解析影响
  const d = new Date(dateStr + "T00:00:00")
  d.setDate(d.getDate() + days)
  return toShanghaiDate(d)
}
