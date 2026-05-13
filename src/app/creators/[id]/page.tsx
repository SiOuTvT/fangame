import { vndbClient } from "@/lib/vndb"
import { notFound } from "next/navigation"
import { CreatorDetailClient } from "./creator-detail-client"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: `创作者详情 · 同人游戏站` }
}

export default async function CreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let creator: any = null

  // id 格式如 s123（staff）或 p123（producer）
  if (id.startsWith("s")) {
    // Staff 创作者
    const vndbId = id.slice(1)
    creator = await vndbClient.getStaffDetail(vndbId)
  } else if (id.startsWith("p")) {
    // Producer 创作者 - 转换为 staff 格式的返回数据
    const vndbId = id.slice(1)
    const producer = await vndbClient.getProducer(vndbId)
    if (producer) {
      creator = {
        id: producer.id,
        name: producer.name,
        original: producer.original,
        description: producer.description,
        gender: undefined,
        vndbId: vndbId,
        roles: [],
        vns: (producer.developed || []).map((vn: any) => ({
          id: vn.id,
          title: vn.title,
          original: "",
          role: "开发者",
          rating: vn.rating,
          image: vn.image?.url,
        })),
      }
    }
  } else {
    // 纯数字 ID，尝试 staff 先，失败再 producer
    creator = await vndbClient.getStaffDetail(id)
    if (!creator) {
      const producer = await vndbClient.getProducer(id)
      if (producer) {
        creator = {
          id: producer.id,
          name: producer.name,
          original: producer.original,
          description: producer.description,
          gender: undefined,
          vndbId: id,
          roles: [],
          vns: (producer.developed || []).map((vn: any) => ({
            id: vn.id,
            title: vn.title,
            original: "",
            role: "开发者",
            rating: vn.rating,
            image: vn.image?.url,
          })),
        }
      }
    }
  }

  if (!creator) notFound()

  return <CreatorDetailClient creator={creator} />
}
