import type { Metadata } from "next"
import { headers } from "next/headers"
import "./globals.css"
import { TopNav } from "@/components/top-nav"
import { Providers } from "@/components/providers"
import { MusicPlayer } from "@/components/music-player"

export const metadata: Metadata = {
  title: "同人游戏站 · 资源大厅",
  description: "东方、月姬、Fate 等同人游戏资源一站式体验",
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") ?? ""
  const isAdmin = pathname.startsWith("/admin")

  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          {!isAdmin && <TopNav />}
          <main className={!isAdmin ? "pt-14 min-h-screen" : "min-h-screen"}>
            <div className={!isAdmin ? "mx-auto max-w-[1200px] px-4 py-5" : ""}>
              {children}
            </div>
          </main>
          {!isAdmin && <MusicPlayer />}
        </Providers>
      </body>
    </html>
  )
}
