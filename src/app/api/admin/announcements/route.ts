import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminSession } from "@/lib/admin"

export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const anns = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(anns)
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const { title, content, link } = await req.json()
  if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 })
  const ann = await prisma.announcement.create({
    data: { title: title.trim(), content: content.trim(), link: link?.trim() ?? "" },
  })
  return NextResponse.json(ann, { status: 201 })
}
