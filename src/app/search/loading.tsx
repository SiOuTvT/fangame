export default function SearchLoading() {
  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 搜索栏骨架 */}
      <div className="mb-6">
        <div className="h-12 w-full rounded-xl bg-muted animate-pulse" />
      </div>

      {/* 筛选栏骨架 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {["w-16", "w-20", "w-24", "w-16", "w-20"].map((w, i) => (
          <div key={i} className={`h-8 ${w} rounded-full bg-muted animate-pulse`} />
        ))}
      </div>

      {/* 结果数量骨架 */}
      <div className="mb-4 h-5 w-32 rounded bg-muted animate-pulse" />

      {/* 游戏卡片网格骨架 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div
              className="w-full animate-pulse rounded-xl bg-muted"
              style={{ aspectRatio: "3 / 4" }}
            />
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}