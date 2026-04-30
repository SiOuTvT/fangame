import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // UploadThing CDN (文件上传服务)
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      // VNDB (视觉小说数据库)
      { protocol: "https", hostname: "static.vndb.org" },
      // 本地开发允许 localhost
      ...(process.env.NODE_ENV === "development"
        ? [{ protocol: "http" as const, hostname: "localhost" }]
        : []),
    ],
  },
};

export default nextConfig;
