/**
 * 密码强度策略（Single Source of Truth）
 *
 * 全站所有"设置/重置密码"入口（注册、找回密码等）统一使用本策略，
 * 避免各业务各自硬编码规则导致强度不一致（M14）。
 */

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 64

/**
 * 校验密码强度。
 * @returns 错误信息字符串；为 null 表示通过。
 */
export function validatePassword(password: string): string | null {
  if (!password) return "密码不能为空"
  if (password.length < PASSWORD_MIN_LENGTH) return `密码至少 ${PASSWORD_MIN_LENGTH} 位`
  if (password.length > PASSWORD_MAX_LENGTH) return `密码最多 ${PASSWORD_MAX_LENGTH} 位`
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "密码需同时包含字母和数字"
  }
  return null
}
