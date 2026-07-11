/**
 * Next.js 启动钩子
 * 在服务器开始处理请求前执行，完成服务配置初始化
 */
export const runtime = "nodejs"

export async function register() {
  const { initServiceConfig } = await import("./lib/service-config")
  await initServiceConfig()
}
