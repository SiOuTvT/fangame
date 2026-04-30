import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin"

export async function GET(req: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })

  const vndbId = req.nextUrl.searchParams.get("id")
  if (!vndbId) return NextResponse.json({ error: "缺少 id 参数" }, { status: 400 })

  const res = await fetch("https://api.vndb.org/kana/staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filters: ["id", "=", vndbId],
      fields: "id,name,lang,gender,description,extlinks{url,label},aliases{name}",
    }),
  })

  if (!res.ok) return NextResponse.json({ error: "VNDB 请求失败" }, { status: 502 })

  const data = await res.json()
  const staff = data.results?.[0]
  if (!staff) return NextResponse.json({ error: "未找到该 Staff" }, { status: 404 })

  // 找日文别名
  const nameJa = staff.aliases?.find((a: { name: string }) =>
    /[\u3040-\u30ff\u4e00-\u9fff]/.test(a.name)
  )?.name ?? ""

  // 提取 Twitter 和 Wikipedia 链接
  const twitterUrl  = staff.extlinks?.find((e: { label: string }) => e.label === "Xitter" || e.label === "Twitter")?.url ?? ""
  const wikipediaUrl = staff.extlinks?.find((e: { label: string }) => e.label?.startsWith("Wikipedia"))?.url ?? ""

  return NextResponse.json({
    vndbId:      staff.id,
    name:        staff.name,
    nameJa,
    bio:         staff.description ?? "",
    gender:      staff.gender ?? "",
    twitterUrl,
    wikipediaUrl,
  })
}
