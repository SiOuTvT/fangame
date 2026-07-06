"use client"

import { cn } from "@/lib/utils"
import { TagInfo } from "@/types/tags-browser"
import { ColorTag } from "@/components/ui/tag"
import { Flame } from "lucide-react"
import { useMemo } from "react"

interface TagCloudProps {
  tags: TagInfo[]
  maxTags?: number
}

/**
 * 热门标签云
 * 标签大小根据游戏数量动态计算
 */
export function TagCloud({ tags, maxTags = 30 }: TagCloudProps) {
  const displayTags = useMemo(() => tags.slice(0, maxTags), [tags, maxTags])

  // 计算字体大小比例
  const { minCount, maxCount } = useMemo(() => {
    if (displayTags.length === 0) {
      return { minCount: 0, maxCount: 0 }
    }
    return {
      minCount: Math.min(...displayTags.map(t => t.gameCount)),
      maxCount: Math.max(...displayTags.map(t => t.gameCount)),
    }
  }, [displayTags])

  function getFontSize(count: number): string {
    if (maxCount === minCount) return "text-sm"

    const ratio = (count - minCount) / (maxCount - minCount)

    if (ratio > 0.8) return "text-lg font-semibold"
    if (ratio > 0.6) return "text-base font-medium"
    if (ratio > 0.4) return "text-sm font-medium"
    return "text-sm"
  }

  function getOpacity(count: number): string {
    if (maxCount === minCount) return "opacity-80"

    const ratio = (count - minCount) / (maxCount - minCount)

    if (ratio > 0.7) return "opacity-100"
    if (ratio > 0.4) return "opacity-85"
    return "opacity-70"
  }

  return (
    <div className="bg-card rounded-2xl p-6 ring-1 ring-border">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5" strokeWidth={2} /> 热门标签
      </h2>
      <div className="flex flex-wrap gap-x-2 gap-y-1.5 sm:gap-x-3 sm:gap-y-2">
        {displayTags.map((tag) => (
          <ColorTag
            key={tag.id}
            variant="cloud"
            color={tag.color}
            href={`/search?tag=${encodeURIComponent(tag.name)}`}
            className={cn(getFontSize(tag.gameCount), getOpacity(tag.gameCount))}
            title={`${tag.gameCount} 个游戏`}
          >
            {tag.name}
            <span className="ml-1.5 text-micro opacity-60">
              ({tag.gameCount})
            </span>
          </ColorTag>
        ))}
      </div>
      {tags.length > maxTags && (
        <p className="mt-3 text-xs text-muted-foreground">
          还有 {tags.length - maxTags} 个标签，请在下方分类中查看
        </p>
      )}
    </div>
  )
}