/**
 * Dev helper: รีเซ็ตเนื้อหา resume ของเจ้าของกลับเป็นข้อมูลจาก src/i18n
 * (ใช้หลังรัน E2E ที่ไปแก้ข้อมูลจริง)  npx tsx prisma/restore-owner.ts
 */
import { PrismaClient } from "@prisma/client";
import { contact, content } from "../src/i18n";
import { resumeDocumentSchema } from "../src/lib/schema";

const prisma = new PrismaClient();
const OWNER_EMAIL = "peerawet1996@gmail.com";

async function main() {
  const user = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });
  if (!user) throw new Error("owner not found");
  const resume = await prisma.resume.findFirst({ where: { userId: user.id } });
  if (!resume) throw new Error("owner resume not found");
  const doc = resumeDocumentSchema.parse({ en: content.en, th: content.th, contact });
  await prisma.resume.update({
    where: { id: resume.id },
    data: { content: doc, published: doc, publishedAt: new Date() },
  });
  console.log(`restored owner resume content: /r/${resume.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
