/**
 * Dev helper: สร้าง session token ตรงใน DB สำหรับเทสต์โดยไม่ต้อง OAuth login
 * (ใช้เฉพาะตอน dev — จะไม่ถูก import โดยแอป)
 *   npx tsx prisma/dev-session.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OWNER_EMAIL = "peerawet1996@gmail.com";
const TOKEN = "e2e-test-session-token";

async function main() {
  const user = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });
  if (!user) throw new Error("owner user not found — run db:seed first");
  await prisma.session.upsert({
    where: { sessionToken: TOKEN },
    update: { expires: new Date(Date.now() + 7 * 86400_000) },
    create: {
      sessionToken: TOKEN,
      userId: user.id,
      expires: new Date(Date.now() + 7 * 86400_000),
    },
  });
  const resume = await prisma.resume.findFirst({ where: { userId: user.id } });
  console.log(
    JSON.stringify({ token: TOKEN, userId: user.id, resumeId: resume?.id, slug: resume?.slug }),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
