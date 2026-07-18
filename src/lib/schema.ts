import { z } from "zod";

/**
 * Zod schemas — mirror ของ interfaces ใน src/i18n/types.ts
 * ใช้ validate JSON `content`/`config` ทุกครั้งก่อนเขียน DB (plan §8)
 * limit ความยาว/จำนวน item กันข้อมูลบวมและ abuse
 */

const line = z.string().max(300);
const paragraph = z.string().max(2000);

/** ลิงก์ที่ user กรอก: อนุญาตเฉพาะ http/https (กัน javascript: ฯลฯ) */
export const safeUrl = z
  .string()
  .max(500)
  .refine((value) => /^https?:\/\//i.test(value), {
    message: "URL must start with http:// or https://",
  });

export const personalSchema = z.object({
  name: line,
  title: line,
  motto: line,
  location: line,
});

export const techCategorySchema = z.object({
  label: line,
  items: z.array(z.string().max(100)).max(40),
});

export const recognitionItemSchema = z.object({
  highlight: line,
  detail: paragraph,
});

export const bulletSchema = z.object({
  lead: line.optional(),
  text: paragraph,
});

export const experienceItemSchema = z.object({
  role: line,
  note: line.optional(),
  company: line,
  period: line,
  bullets: z.array(bulletSchema).max(20),
});

export const educationItemSchema = z.object({
  title: line,
  detail: line.optional(),
  highlight: line.optional(),
  period: line.optional(),
});

export const projectLinkSchema = z.object({
  label: z.string().max(100),
  url: safeUrl,
});

export const projectSchema = z.object({
  name: line,
  status: z.string().max(50).optional(),
  links: z.array(projectLinkSchema).max(10),
  lead: line.optional(),
  description: paragraph,
});

export const uiTextSchema = z.object({
  sections: z.object({
    profile: line,
    techStack: line,
    recognition: line,
    experience: line,
    education: line,
    projects: line,
  }),
  status: z.record(z.string(), z.string().max(100)),
  print: line,
  footerRole: line,
});

export const resumeContentSchema = z.object({
  personal: personalSchema,
  profile: paragraph,
  techStack: z.array(techCategorySchema).max(20),
  recognition: z.array(recognitionItemSchema).max(20),
  experience: z.array(experienceItemSchema).max(20),
  education: z.array(educationItemSchema).max(20),
  projects: z.array(projectSchema).max(20),
  ui: uiTextSchema,
});

/** ขอบเขตการย่อ/ขยาย/เลื่อนรูปโปรไฟล์ — ต้องตรงกับ clamp ฝั่ง UI (Header.tsx) */
export const PHOTO_SIZE_MIN = 56;
export const PHOTO_SIZE_MAX = 160;
export const PHOTO_ZOOM_MIN = 1;
export const PHOTO_ZOOM_MAX = 3;

/**
 * URL รูป: อนุญาตเฉพาะ path ภายใน (/photo.jpg ของเจ้าของเดิม) หรือ https
 * (Vercel Blob) — กัน javascript: และ data: base64 ก้อนโตเข้า DB
 */
const photoUrl = z
  .string()
  .max(500)
  .refine((value) => value.startsWith("/") || /^https:\/\//i.test(value), {
    message: "Photo URL must be an internal path or https",
  });

export const contactInfoSchema = z.object({
  phone: z.string().max(50).optional(),
  email: z.string().max(200).optional(),
  github: z.string().max(200).optional(),
  githubUrl: safeUrl.optional(),
  linkedin: z.string().max(200).optional(),
  linkedinUrl: safeUrl.optional(),
  photo: photoUrl.optional(),
  photoSize: z.number().min(PHOTO_SIZE_MIN).max(PHOTO_SIZE_MAX).optional(),
  photoZoom: z.number().min(PHOTO_ZOOM_MIN).max(PHOTO_ZOOM_MAX).optional(),
  // clamp จริงตาม zoom ทำตอน render — เก็บหลวมๆ แค่กันค่าหลุดโลก
  photoX: z.number().min(-150).max(150).optional(),
  photoY: z.number().min(-150).max(150).optional(),
});

/**
 * เอกสาร resume ทั้งก้อนที่เก็บใน Resume.content / Resume.published
 * รองรับภาษาเดียวหรือสองภาษา (en/th) — ต้องมีอย่างน้อย 1 ภาษา
 */
export const resumeDocumentSchema = z
  .object({
    en: resumeContentSchema.optional(),
    th: resumeContentSchema.optional(),
    contact: contactInfoSchema,
  })
  .refine((doc) => doc.en || doc.th, {
    message: "Resume must have at least one language",
  });

/** Resume.config — การตั้งค่าการแสดงผลที่เจ้าของเซฟไว้ */
export const resumeConfigSchema = z.object({
  fontDelta: z.number().min(-20).max(40),
  leftPct: z.number().min(18).max(45),
  lang: z.enum(["en", "th"]),
  photoUrl: z.string().max(500).optional(),
});

export type ResumeDocument = z.infer<typeof resumeDocumentSchema>;
export type ResumeConfig = z.infer<typeof resumeConfigSchema>;

export const defaultConfig: ResumeConfig = {
  fontDelta: 0,
  leftPct: 28,
  lang: "en",
};
