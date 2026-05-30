import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars')
const FRAME_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatar-frames')

/**
 * 合成头像和头像框
 * @param avatarUrl 原始头像 URL（/uploads/xxx.jpg）
 * @param frameId 头像框 ID
 * @returns 合成后的头像 URL（/uploads/avatars/composed-xxx.png）
 */
export async function composeAvatar(
  avatarUrl: string,
  frameId: string
): Promise<string> {
  try {
    // 确保输出目录存在
    await fs.mkdir(OUTPUT_DIR, { recursive: true })

    // 获取头像框图片路径
    const framePath = path.join(FRAME_DIR, `${frameId}.png`)
    
    // 检查头像框文件是否存在
    try {
      await fs.access(framePath)
    } catch {
      console.warn(`头像框文件不存在: ${framePath}`)
      return avatarUrl // 返回原头像
    }

    // 读取原始头像
    const avatarPath = path.join(process.cwd(), 'public', avatarUrl)
    const avatarBuffer = await sharp(avatarPath)
      .resize(200, 200, { fit: 'cover' })
      .png()
      .toBuffer()

    // 读取头像框
    const frameBuffer = await sharp(framePath)
      .resize(200, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()

    // 合成图片
    const composedBuffer = await sharp(avatarBuffer)
      .composite([{
        input: frameBuffer,
        top: 0,
        left: 0
      }])
      .png()
      .toBuffer()

    // 生成唯一文件名
    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 8)
    const filename = `composed-${frameId}-${timestamp}-${random}.png`
    const outputPath = path.join(OUTPUT_DIR, filename)

    // 保存合成后的图片
    await fs.writeFile(outputPath, composedBuffer)

    console.log(`✓ 头像合成完成: ${filename}`)
    return `/uploads/avatars/${filename}`
  } catch (error) {
    console.error('头像合成失败:', error)
    return avatarUrl // 失败时返回原头像
  }
}

/**
 * 清理用户旧的合成头像文件
 */
export async function cleanupOldComposedAvatar(composedUrl: string): Promise<void> {
  if (!composedUrl || !composedUrl.startsWith('/uploads/avatars/composed-')) {
    return
  }

  try {
    const filePath = path.join(process.cwd(), 'public', composedUrl)
    await fs.unlink(filePath)
    console.log(`✓ 已清理旧合成头像: ${composedUrl}`)
  } catch (error) {
    // 文件可能已被删除，忽略错误
    console.warn('清理旧合成头像失败:', error)
  }
}