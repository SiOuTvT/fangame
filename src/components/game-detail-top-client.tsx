"use client"

import { cn } from "@/lib/utils"
import { Download, Heart, Loader2, Share2 } from "lucide-react"
import { useState } from "react"
import { CollectionPickerDialog } from "./collection-picker-dialog"
import { ConfirmDialog } from "./ui/confirm-dialog"

export function GameDetailTopClient({
  gameId,
  downloadLinks,
  isFav,
  isLoggedIn,
}: {
  gameId: string
  downloadLinks: { label: string; url: string }[]
  isFav: boolean
  isLoggedIn: boolean
}) {
  const [fav, setFav] = useState(isFav)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [unfavoriting, setUnfavoriting] = useState(false)

  function handleFavoriteClick() {
    if (!isLoggedIn) return
    if (fav) {
      // 已收藏 → 弹出确认取消收藏弹窗
      setConfirmOpen(true)
    } else {
      // 未收藏 → 弹出收藏集选择弹窗
      setDialogOpen(true)
    }
  }

  async function handleUnfavorite() {
    setUnfavoriting(true)
    try {
      const res = await fetch(`/api/games/${gameId}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        setFav(false)
      }
    } finally {
      setUnfavoriting(false)
    }
  }

  function handleSelect(_collectionId: string | null) {
    // 收藏集选择完成后更新状态
    setFav(true)
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: document.title, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2.5">
        {/* 下载按钮 — 点击跳转到页面底部资源区 */}
        {downloadLinks.length > 0 && (
          <a
            href={downloadLinks[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-opacity hover:opacity-90 bg-primary text-primary-foreground"
          >
            <Download className="w-4 h-4" strokeWidth={2.5} />
            下载
          </a>
        )}

        {/* 收藏按钮 — 爱心变色 */}
          <button
            onClick={handleFavoriteClick}
            disabled={!isLoggedIn || unfavoriting}
            className={cn(
              "flex items-center justify-center rounded-lg px-3.5 py-2.5 transition-all disabled:opacity-50",
              fav
                ? "bg-secondary border border-transparent"
                : "bg-secondary border border-border"
            )}
          >
            {unfavoriting ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <Heart
                className={cn("w-4 h-4 transition-colors", fav ? "text-rose-500" : "text-muted-foreground")}
              strokeWidth={2}
              fill={fav ? "currentColor" : "none"}
              style={fav ? { filter: "drop-shadow(0 1px 2px rgba(231,76,111,0.4))" } : undefined}
            />
          )}
        </button>

        {/* 分享按钮 */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center rounded-lg px-3.5 py-2.5 transition-colors bg-secondary border border-border text-muted-foreground"
          >
            <Share2 className="w-4 h-4" strokeWidth={2} />
          </button>
      </div>

      <CollectionPickerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={handleSelect}
        isFav={fav}
        gameId={gameId}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="取消收藏"
        description="确定要取消收藏这个游戏吗？"
        confirmText="取消收藏"
        cancelText="再想想"
        variant="destructive"
        onConfirm={handleUnfavorite}
      />
    </>
  )
}