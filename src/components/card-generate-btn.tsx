"use client"

import { Download, Loader2 } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"

interface CardData {
  username: string
  uid: string
  avatar: string | null
  composedAvatarUrl: string | null
  banner: string | null
  bio: string
  role: string
  createdAt: string
  favCount: number
  commentCount: number
  followerCount: number
  followingCount: number
}

function getRoleLabel(role: string) {
  if (role === "SUPER_ADMIN") return "站长"
  if (role === "ADMIN") return "管理员"
  return null
}

export function CardGenerateBtn({ data }: { data: CardData }) {
  const [generating, setGenerating] = useState(false)
  const generatingRef = useRef(false)
  const abortRef = useRef(false)
  const dataRef = useRef(data)
  dataRef.current = data

  const generate = useCallback(async () => {
    if (generatingRef.current) return
    generatingRef.current = true
    setGenerating(true)
    abortRef.current = false

    const d = dataRef.current
    const log = (step: string) => console.log(`[名片] ${step}`)

    try {
      log("start")
      const W = 900, H = 500
      const canvas = document.createElement("canvas")
      canvas.width = W * 2
      canvas.height = H * 2
      let ctx = canvas.getContext("2d")
      if (!ctx) { toast.error("浏览器不支持 Canvas"); return }
      ctx = ctx!
      ctx.scale(2, 2)
      log("canvas created")

      // 头像加载
      const avatarSrc = d.composedAvatarUrl || d.avatar
      let avatarImg: HTMLImageElement | null = null
      if (avatarSrc) {
        log("loading avatar: " + avatarSrc)
        try {
          avatarImg = await loadImageSafe(avatarSrc)
          log("avatar loaded")
        } catch (e) {
          log("avatar failed: " + e)
        }
      }

      log("drawing background...")
      const R = 20
      const ctx2 = ctx!
      function roundRect(x: number, y: number, w: number, h: number, r: number) {
        ctx2.beginPath()
        ctx2.moveTo(x + r, y)
        ctx2.lineTo(x + w - r, y)
        ctx2.arcTo(x + w, y, x + w, y + r, r)
        ctx2.lineTo(x + w, y + h - r)
        ctx2.arcTo(x + w, y + h, x + w - r, y + h, r)
        ctx2.lineTo(x + r, y + h)
        ctx2.arcTo(x, y + h, x, y + h - r, r)
        ctx2.lineTo(x, y + r)
        ctx2.arcTo(x, y, x + r, y, r)
        ctx2.closePath()
      }

      roundRect(0, 0, W, H, R)
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, "#0f0f14")
      bg.addColorStop(1, "#12121a")
      ctx.fillStyle = bg
      ctx.fill()

      const glow1 = ctx.createRadialGradient(W * 0.75, H * 0.15, 0, W * 0.75, H * 0.15, 280)
      glow1.addColorStop(0, "rgba(168, 85, 247, 0.07)")
      glow1.addColorStop(1, "transparent")
      ctx.fillStyle = glow1
      ctx.fillRect(0, 0, W, H)

      const glow2 = ctx.createRadialGradient(W * 0.15, H * 0.85, 0, W * 0.15, H * 0.85, 240)
      glow2.addColorStop(0, "rgba(232, 120, 154, 0.05)")
      glow2.addColorStop(1, "transparent")
      ctx.fillStyle = glow2
      ctx.fillRect(0, 0, W, H)

      roundRect(0.5, 0.5, W - 1, H - 1, R)
      ctx.strokeStyle = "rgba(255,255,255,0.06)"
      ctx.lineWidth = 1
      ctx.stroke()

      // 头像
      const acx = 80, acy = 105, ar = 48
      let avatarOk = false

      if (avatarImg) {
        try {
          ctx.save()
          ctx.beginPath()
          ctx.arc(acx, acy, ar, 0, Math.PI * 2)
          ctx.closePath()
          ctx.clip()
          ctx.drawImage(avatarImg, acx - ar, acy - ar, ar * 2, ar * 2)
          ctx.restore()
          avatarOk = true
          log("avatar drawn")
        } catch { /* ignore */ }
      }

      if (!avatarOk) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(acx, acy, ar, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        const grad = ctx.createLinearGradient(acx - ar, acy - ar, acx + ar, acy + ar)
        grad.addColorStop(0, "#e8789a")
        grad.addColorStop(1, "#a855f7")
        ctx.fillStyle = grad
        ctx.fillRect(acx - ar, acy - ar, ar * 2, ar * 2)
        ctx.fillStyle = "#fff"
        ctx.font = "bold 30px 'Noto Sans SC', 'PingFang SC', sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(d.username[0]?.toUpperCase() || "?", acx, acy + 1)
        ctx.restore()
      }

      ctx.strokeStyle = "rgba(232, 120, 154, 0.4)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(acx, acy, ar + 2, 0, Math.PI * 2)
      ctx.stroke()

      log("drawing text...")
      const textX = acx + ar + 20
      ctx.textAlign = "start"
      ctx.textBaseline = "alphabetic"

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 26px 'Noto Sans SC', 'PingFang SC', sans-serif"
      ctx.fillText(d.username, textX, acy - 8)

      ctx.fillStyle = "rgba(255,255,255,0.3)"
      ctx.font = "12px 'Noto Sans SC', 'PingFang SC', sans-serif"
      ctx.fillText(`UID: ${d.uid}`, textX, acy + 16)

      const roleLabel = getRoleLabel(d.role)
      if (roleLabel) {
        ctx.font = "11px 'Noto Sans SC', 'PingFang SC', sans-serif"
        const tw = ctx.measureText(roleLabel).width
        const rx = textX + ctx.measureText(`UID: ${d.uid}`).width + 16
        roundRect(rx, acy + 6, tw + 14, 18, 9)
        ctx.fillStyle = "rgba(232, 120, 154, 0.15)"
        ctx.fill()
        roundRect(rx, acy + 6, tw + 14, 18, 9)
        ctx.strokeStyle = "rgba(232, 120, 154, 0.3)"
        ctx.lineWidth = 0.5
        ctx.stroke()
        ctx.fillStyle = "rgba(232, 120, 154, 0.9)"
        ctx.textAlign = "center"
        ctx.fillText(roleLabel, rx + (tw + 14) / 2, acy + 18)
      }

      ctx.textAlign = "start"
      if (d.bio) {
        ctx.fillStyle = "rgba(255,255,255,0.4)"
        ctx.font = "13px 'Noto Sans SC', 'PingFang SC', sans-serif"
        const lines = wrapText(ctx, d.bio, W - 120)
        lines.slice(0, 2).forEach((line, i) => {
          ctx.fillText(line, 50, 170 + i * 20)
        })
      }

      log("drawing stats...")
      ctx.strokeStyle = "rgba(255,255,255,0.05)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(50, 220)
      ctx.lineTo(W - 50, 220)
      ctx.stroke()

      const stats = [
        { label: "收藏", value: d.favCount },
        { label: "关注者", value: d.followerCount },
        { label: "关注中", value: d.followingCount },
        { label: "评论", value: d.commentCount },
      ]
      const colW = (W - 100) / 4
      const statsY = 260

      stats.forEach((s, i) => {
        const cx = 50 + i * colW + colW / 2
        ctx.textAlign = "center"
        ctx.fillStyle = "rgba(255,255,255,0.3)"
        ctx.font = "12px 'Noto Sans SC', 'PingFang SC', sans-serif"
        ctx.fillText(s.label, cx, statsY)
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 30px 'Noto Sans SC', 'PingFang SC', sans-serif"
        ctx.fillText(formatNum(s.value), cx, statsY + 42)
      })

      log("drawing bottom...")
      ctx.strokeStyle = "rgba(255,255,255,0.05)"
      ctx.beginPath()
      ctx.moveTo(50, 345)
      ctx.lineTo(W - 50, 345)
      ctx.stroke()

      ctx.textAlign = "start"
      ctx.fillStyle = "rgba(255,255,255,0.2)"
      ctx.font = "12px 'Noto Sans SC', 'PingFang SC', sans-serif"
      const joinDate = new Date(d.createdAt).toLocaleDateString("zh-CN", {
        year: "numeric", month: "long", day: "numeric",
      })
      ctx.fillText(`加入于 ${joinDate}`, 50, 375)

      ctx.textAlign = "right"
      ctx.fillStyle = "rgba(255,255,255,0.12)"
      ctx.font = "11px 'Noto Sans SC', 'PingFang SC', sans-serif"
      ctx.fillText("同人游戏站 · fangame", W - 50, 375)

      const lineGrad = ctx.createLinearGradient(0, 0, W, 0)
      lineGrad.addColorStop(0, "rgba(232, 120, 154, 0)")
      lineGrad.addColorStop(0.35, "rgba(232, 120, 154, 0.5)")
      lineGrad.addColorStop(0.65, "rgba(168, 85, 247, 0.5)")
      lineGrad.addColorStop(1, "rgba(168, 85, 247, 0)")
      ctx.fillStyle = lineGrad
      ctx.fillRect(0, H - 3, W, 3)

      log("converting to blob...")
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      )
      if (!blob) { toast.error("生成失败"); return }

      log("downloading...")
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${d.username}_名片.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("名片已生成")
    } catch (e) {
      console.error("[名片生成]", e)
      toast.error("生成失败：" + (e instanceof Error ? e.message : "未知错误"))
    } finally {
      generatingRef.current = false
      setGenerating(false)
    }
  }, [])

  return (
    <button
      onClick={() => {
        console.log("[名片] clicked")
        generate()
      }}
      type="button"
      disabled={generating}
      className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-secondary/60 px-3 py-3 transition-all hover:bg-secondary disabled:opacity-60"
    >
      {generating ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" strokeWidth={2} />
      ) : (
        <Download className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
      )}
      <span className="text-xs font-medium text-foreground">
        {generating ? "生成中…" : "生成名片"}
      </span>
    </button>
  )
}

function loadImageSafe(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    fetch(src)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.blob()
      })
      .then(blob => {
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error(`Failed to load blob: ${src}`))
        img.src = URL.createObjectURL(blob)
      })
      .catch(err => reject(err instanceof Error ? err : new Error(`Fetch failed: ${src}`)))
  })
}

function formatNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + "w"
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k"
  return String(n)
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let current = ""
  for (const char of text) {
    const test = current + char
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current + "…")
      current = ""
      break
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}