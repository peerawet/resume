import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // อย่าให้ Next bundle Prisma/Neon driver ฝั่ง server — native/wasm binding พังตอน bundle
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-neon",
    "@neondatabase/serverless",
  ],
  // Phase 4 จะเพิ่ม images.remotePatterns สำหรับ Vercel Blob ที่นี่
};

export default nextConfig;
