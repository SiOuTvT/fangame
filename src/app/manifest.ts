import { MetadataRoute } from "next"

const BASE = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "同人游戏站 · 资源大厅",
    short_name: "同人游戏站",
    description: "东方、月姬、Fate 等同人游戏资源一站式体验",
    start_url: "/",
    display: "standalone",
    background_color: "#08080a",
    theme_color: "#E0A87C",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
