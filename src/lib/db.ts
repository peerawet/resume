import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

// Node 22+ มี WebSocket ในตัว — ไม่ต้องพึ่ง package `ws`
// (ห้ามใช้ `ws` ที่ถูก Next bundle: bufferUtil.mask พังตอน runtime)
neonConfig.webSocketConstructor = globalThis.WebSocket;

function createClient() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

// singleton กัน hot-reload สร้าง connection ใหม่ทุกครั้งใน dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
