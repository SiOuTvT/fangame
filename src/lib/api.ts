/**
 * 统一 API 请求层（M2）
 *
 * 消除前端各处重复的 fetch + 错误解析 + toast 模式。
 * 所有 API 路由统一返回 { data?, error? } 格式（via withHandler）。
 */

/**
 * 发起 API DELETE 请求，返回成功/失败状态
 */
export async function apiDelete(url: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, { method: "DELETE" })
    if (res.ok) return { ok: true }
    const body = await res.json().catch(() => null)
    return { ok: false, error: body?.error || "删除失败" }
  } catch {
    return { ok: false, error: "网络错误，请稍后再试" }
  }
}

/**
 * 发起 API 请求并返回解析后的响应
 * 自动处理 JSON 解析和错误提取
 */
export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit,
): Promise<{ data?: T; error?: string; ok: boolean }> {
  try {
    const res = await fetch(url, options)
    const body = await res.json().catch(() => null)
    if (res.ok) return { data: body?.data ?? body, ok: true }
    return { ok: false, error: body?.error || "请求失败" }
  } catch {
    return { ok: false, error: "网络错误，请稍后再试" }
  }
}
