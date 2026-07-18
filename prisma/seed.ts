import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { contact, content } from "../src/i18n";
import { resumeDocumentSchema, defaultConfig } from "../src/lib/schema";

const prisma = new PrismaClient();

const OWNER_EMAIL = "peerawet1996@gmail.com";

async function main() {
  const doc = resumeDocumentSchema.parse({
    en: content.en,
    th: content.th,
    contact,
  });

  const user = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: {},
    create: { email: OWNER_EMAIL, name: content.en.personal.name },
  });

  const existing = await prisma.resume.findFirst({
    where: { userId: user.id },
  });
  if (existing) {
    console.log(`owner resume already exists: /r/${existing.slug}`);
    return;
  }

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      slug: nanoid(10),
      title: "Peerawet Chursuk — Resume",
      content: doc,
      published: doc, // เผยแพร่ทันที — ใช้ทดสอบหน้า /r/[slug]
      config: { ...defaultConfig, photoUrl: "/photo.jpg" },
      isPublic: true,
      publishedAt: new Date(),
    },
  });
  console.log(`seeded owner resume: /r/${resume.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
