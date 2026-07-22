"use client"

import { logger } from "@/lib/logger";
import { Languages, Loader2 } from "lucide-react";
import { useState } from "react";
import { apiFetchSafe } from "@/lib/api-client";

/**
 * 一键翻译按钮
 * 使用 Google Translate 免费 API 将英文翻译为中文
 */
export function TranslateBtn({ text, onTranslated }: { text: string; onTranslated: (translated: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function translate() {
    setLoading(true)
    try {
      const { ok, data, error } = await apiFetchSafe<{ translated?: string; error?: string }>("/api/translate", {
        method: "POST",
        body: { text: text.slice(0, 5000) },
      })
      if (data?.translated) {
        onTranslated(data.translated)
        setDone(true)
      } else {
        logger.api.warn("翻译失败", { ok, error })
      }
    } catch (err) {
      logger.api.error("翻译失败", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={translate}
      disabled={loading || done}
      className="flex items-center gap-1.5 rounded-lg bg-secondary/80 px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-border transition-all hover:bg-accent hover:text-foreground disabled:opacity-50"
      title="将英文描述翻译为中文"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
      ) : (
        <Languages className="h-3.5 w-3.5" strokeWidth={2} />
      )}
      {done ? "已翻译" : "翻译为中文"}
    </button>
  )
}