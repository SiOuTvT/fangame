import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email?.trim()) return NextResponse.json({ error: "请输入邮箱" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })

  // 不管用户存不存在都返回同样的提示，防止枚举
  if (!user) {
    return NextResponse.json({ ok: true })
  }

  // 删除旧令牌
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

  // 生成新令牌，1小时有效
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  // TODO: 接入 Resend 发邮件
  // 现阶段：管理员可在后台看到重置链接
  console.log(`[密码重置] ${user.email} → ${resetUrl}`)

  return NextResponse.json({ ok: true })
}
