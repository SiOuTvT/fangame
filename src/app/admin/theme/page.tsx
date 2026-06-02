"use client"

import { ThemeEditor } from "@/components/theme-editor"
import { useThemeSettings, type FullThemeSettings } from "@/components/theme-provider"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export default function ThemeSettingsPage() {
  const { settings: ctxSettings, applyAll } = useThemeSettings()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const handleSave = useCallback(async (settingsToSave: FullThemeSettings) => {
    const res = await fetch("/api/admin/site-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsToSave),
    })
    if (res.ok) {
      applyAll(settingsToSave)
      toast.success("主题已保存")
    } else {
      throw new Error("Save failed")
    }
  }, [applyAll])

  if (!mounted) return <div className="h-96 animate-pulse rounded-xl bg-muted" />

  return <ThemeEditor initialSettings={ctxSettings} onSave={handleSave} />
}
