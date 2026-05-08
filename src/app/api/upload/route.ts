import { auth } from "@/lib/auth"
import crypto from "crypto"
import { mkdir, writeFile } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    // 验证登录
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 })
    }

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "只能上传图片文件" }, { status: 400 })
    }

    // 验证文件大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不能超过 10MB" }, { status: 400 })
    }

    // 生成唯一文件名
    const ext = file.name.split(".").pop() || "jpg"
    const hash = crypto.randomBytes(8).toString("hex")
    const timestamp = Date.now()
    const fileName = `${timestamp}-${hash}.${ext}`

    // 按年月分目录
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const uploadDir = path.join(process.cwd(), "public", "uploads", yearMonth)

    // 确保目录存在
    await mkdir(uploadDir, { recursive: true })

    // 写入文件
    const filePath = path.join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // 返回可访问的 URL
    const url = `/uploads/${yearMonth}/${fileName}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error("上传失败:", error)
    return NextResponse.json({ error: "上传失败，请重试" }, { status: 500 })
  }
}