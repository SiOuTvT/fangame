"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface CreatorInfo {
  id: string
  name: string
  nameJa: string | null
  avatar: string | null
  gender: string | null
  vndbId: string | null
  gameCount: number
}

interface GameItem {
  id: string
  title: string
  coverImage: string | null
  roles: string[]
}

interface CreatorDetailDialogProps {
  creator: CreatorInfo | null
  onClose: () => void
}

export function CreatorDetailDialog({ creator, onClose }: CreatorDetailDialogProps) {
  const [games, setGames] = useState<GameItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!creator) { setGames([]); return }
    setLoading(true)
    fetch(`/api/admin/creators/${creator.id}/games`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setGames(data))
      .catch(() => setGames([]))
      .finally(() => setLoading(false))
  }, [creator])

  if (!creator) return null

  return (
    <Dialog open={!!creator} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创作者详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 头像 + 基本信息 */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
              {creator.avatar ? (
                <img src={creator.avatar} alt={creator.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-400 text-lg font-bold text-white">
                  {creator.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{creator.name}</h3>
              {creator.nameJa && (
                <p className="text-sm text-muted-foreground">{creator.nameJa}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {creator.gender && (
                  <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{creator.gender}</span>
                )}
                <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                  {creator.gameCount} 个游戏
                </span>
              </div>
            </div>
          </div>

          {/* VNDB 链接 */}
          {creator.vndbId && (
            <a
              href={`https://vndb.org/s${creator.vndbId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              在 VNDB 查看
            </a>
          )}

          {/* 关联游戏 */}
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">作品</h4>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : games.length > 0 ? (
              <div className="space-y-2">
                {games.map(game => (
                  <div key={game.id} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2.5">
                    <div className="h-10 w-8 shrink-0 overflow-hidden rounded bg-muted">
                      {game.coverImage ? (
                        <img src={game.coverImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{game.title}</p>
                      <p className="text-[10px] text-muted-foreground">{game.roles.join("、")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">暂无作品</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
