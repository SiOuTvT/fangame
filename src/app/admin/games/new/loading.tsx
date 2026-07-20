export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded-lg bg-muted" />
      </div>
      <div className="rounded-xl border border-border p-6 space-y-4">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-10 w-full rounded-lg bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-10 w-full rounded-lg bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-32 w-full rounded-lg bg-muted" />
      </div>
    </div>
  )
}
