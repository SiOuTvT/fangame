import { prisma } from "@/lib/prisma"
import { isValidPosition } from "@/lib/tag-positions"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/tags/by-position/[position]
 * 
 * 根据方位获取标签组及其标签列表（前台公开接口）
 * 返回绑定了该方位的所有标签组，每个组包含其下可见标签
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ position: string }> }
) {
  const { position } = await params

  if (!isValidPosition(position)) {
    return NextResponse.json({ error: "无效的方位参数" }, { status: 400 })
  }

  // 查找所有绑定了该方位的标签组，排除该方位下没有标签的空组
  const groups = await prisma.tagGroup.findMany({
    where: {
      positions: { contains: `"${position}"` },
      tags: { some: { isVisible: true } },
    },
    orderBy: { name: "asc" },
    include: {
      tags: {
        where: { isVisible: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  })

  return NextResponse.json(
    groups.map(g => ({
      id: g.id,
      name: g.name,
      description: g.description,
      color: g.color,
      positions: JSON.parse(g.positions) as string[],
      tags: g.tags.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        color: t.color,
      })),
    }))
  )
}