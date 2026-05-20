import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-8xl font-bold text-muted-foreground/20">404</div>
      <h1 className="text-2xl font-semibold text-foreground">页面未找到</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        抱歉，您访问的页面不存在或已被移除。
      </p>
      <Link
        href="/"
        className="rounded-xl px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--clr-blue)" }}
      >
        返回首页
      </Link>
    </div>
  )
}