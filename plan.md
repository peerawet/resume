# Plan: Resume SaaS — Next.js + Neon + Prisma + AWS S3

> เอกสารนี้เขียนไว้ให้ session ถัดไปทำงานต่อได้โดยไม่ต้องอ่านบทสนทนาเดิม
> ภาษา: ผู้ใช้ (เจ้าของโปรเจกต์) สื่อสารภาษาไทย — ตอบ/รายงานเป็นภาษาไทย, โค้ดและ identifier เป็นอังกฤษ

## 0. สถานะล่าสุด (2026-07-18) — branch `saas`

- **Phase 1 เสร็จ + commit แล้ว** — Next.js 15 App Router + Tailwind v4, `<ResumeView content contact config>` แยกแล้ว (sections อ่านผ่าน `ResumeDataContext`), mobile stack < md (ปิด auto-fit/column-drag), print ยังบังคับ A4, feature §3 ครบไม่ regress
- **Phase 2 เสร็จเกือบหมด + commit แล้ว** — Prisma schema + migration `init` apply กับ Neon จริงแล้ว, seed แล้ว: **resume เจ้าของอยู่ที่ `/r/j7Ols3I1qu`** (user `peerawet1996@gmail.com`), `/dashboard` + `/r/[slug]` + Server Actions (create/delete/publish/unpublish + ownership check) ทำงานแล้ว ทดสอบผ่าน dev server จริง
- **ค้างอย่างเดียว: OAuth credentials** — ผู้ใช้ต้องสร้าง Google/GitHub OAuth app แล้วใส่ `AUTH_GOOGLE_ID/SECRET`, `AUTH_GITHUB_ID/SECRET` ใน `.env` → แล้วค่อยเทสต์ login (DoD Phase 2 ข้อสุดท้าย)
- การตัดสินใจที่เกิดขึ้นระหว่างทำ (จาก §12 Q1): `content`/`published` เก็บรูปทรง `{ en?, th?, contact }` — บังคับอย่างน้อย 1 ภาษา, resume ใหม่เริ่ม en เดียว เพิ่ม th ทีหลังได้ (superset รองรับทั้งสองคำตอบ), `contact` ย้ายเข้า document แล้ว (`ContactInfo` optional ทุก field)
- Gotcha ที่แก้แล้ว: **ห้ามใช้ package `ws` กับ Next** (bundle แล้ว `bufferUtil.mask` พัง) — ใช้ `globalThis.WebSocket` ของ Node 22 + `serverExternalPackages` ใน next.config.ts แทน
- ⚠️ `.env.example` ในเวิร์กกิ้งทรียังมี Neon credentials จริงที่ผู้ใช้วางไว้ — **ห้าม commit** (ค่าจริงถูกย้ายไป `.env` แล้ว รวมถึง `DIRECT_URL` ที่แก้เป็น host ไม่มี `-pooler` และ `AUTH_SECRET` ที่ generate แล้ว); ควรคืน placeholder แล้ว rotate password ถ้าเผลอ commit
- Local dev: port 3000/3001 มีแอปอื่นใช้อยู่ — ใช้ `npx next dev -p 3777`
- **Phase 3 เสร็จ + ทดสอบ E2E ผ่านครบ (2026-07-18)** — inline editor ทั้งตัว:
  - `editing.tsx`: `EditingContext` + `<EditableText>` (span→input/textarea, typography inherit ผ่าน `.editable-input`, Enter/blur commit, Esc cancel, Shift+Enter newline) + `<SortableList>` (dnd-kit, variant block/chip, เพิ่ม/ลบ/ลาก) + `UrlEditButton` (prompt-based MVP)
  - ทุก section + Header + footer role แก้ inline ได้; `/editor/[id]` มี autosave debounce 1s (`updateDraft` action + zod validate), lang tabs EN/ไทย + ปุ่มเพิ่มภาษา (copy จากภาษาปัจจุบัน), Publish/Unpublish, ปรับฟ้อนต์/คอลัมน์ autosave ลง config ผ่าน `onConfigChange`
  - E2E (playwright, session token ตรงใน DB แทน OAuth): anon redirect, ownership 404, inline edit, autosave, refresh คง draft, guest ไม่เห็น draft จน publish, add bullet, mobile edit — **ผ่านทั้งหมด**; หลังเทสต์รัน `npx tsx prisma/restore-owner.ts` เพื่อรีเซ็ตข้อมูลเจ้าของ และลบ session token ทดสอบออกจาก DB แล้ว
  - Gotcha: production/self-host ต้องมี `AUTH_TRUST_HOST=true` (เพิ่มใน `.env` แล้ว; Vercel เซ็ตให้เอง) ไม่งั้น auth() โยน UntrustedHost เงียบๆ
  - dev helpers: `prisma/dev-session.ts` (สร้าง session เทสต์), `prisma/restore-owner.ts`
- OAuth credentials ยังไม่ทำ (ผู้ใช้สั่งข้ามเมื่อ 2026-07-18) — login จริงยังเทสต์ไม่ได้จนกว่าจะมี
- ถัดไป: **Phase 4 (Vercel Blob upload + hardening §8)** — ต้องมี Vercel project + Blob store ก่อน

## 1. เป้าหมาย

เปลี่ยนโปรเจกต์ resume ส่วนตัว (Vite SPA) ให้เป็น **SaaS resume builder**:

- มีระบบ login — คนอื่นสมัครเข้ามาสร้าง resume ของตัวเองได้ (multi-tenant)
- **แก้เนื้อหาแบบ inline ในตัว resume โดยตรง** (ไม่ใช่ split-view form) — ผู้ใช้ยืนยันชัดเจนว่าต้องการแบบนี้
- Publish เป็นลิงก์สาธารณะให้ guest เข้าดูได้ โดยไม่ต้อง deploy ใหม่
- รองรับ mobile (ทั้งดูและแก้)
- อัพโหลดรูปโปรไฟล์ผ่าน **Vercel Blob** (client upload) — เดิมผู้ใช้อยากใช้ AWS S3 แต่เปลี่ยนเป็น Blob เมื่อ 2026-07-18 เพราะง่ายกว่ามาก (ตัดงานตั้งค่า AWS ทั้งหมด)
- Deploy บน Vercel, ฐานข้อมูล Neon (Postgres)

### MVP ที่ตกลงกัน (ตัด scope ให้คม)

สมัคร/login → สร้าง resume → แก้ inline → publish เป็นลิงก์สาธารณะ → mobile + print ใช้ได้

**นอก MVP** (ทำทีหลัง อย่าเพิ่งแตะ): หลาย template, payment/billing, analytics, AI, server-side PDF export (Puppeteer), custom domain, username claim

## 2. Stack (ตัดสินใจแล้ว — อย่าเปลี่ยนโดยไม่ถามผู้ใช้)

| ส่วน | เลือกใช้ | เหตุผล/เงื่อนไข |
|---|---|---|
| Framework | Next.js (App Router) | SSR หน้า public, Server Actions สำหรับ mutation |
| DB | Neon Postgres | serverless, free tier พอ |
| ORM | **Prisma** + `@prisma/adapter-neon` | ผู้ใช้ถามเรื่อง migration — Prisma migrate ง่ายกว่า Drizzle; ใช้ driver adapter แก้ปัญหา serverless |
| Auth | Auth.js (NextAuth v5) + Google/GitHub OAuth | multi-user; Clerk เกินจำเป็น |
| Validation | Zod | validate JSON content ตอน save (แทน compile-time check ที่เสียไป) |
| Reorder | dnd-kit | รองรับ pointer + touch |
| รูปภาพ | **Vercel Blob** (`@vercel/blob`) | client upload ในตัว, token อัตโนมัติ, ไม่ต้องตั้ง AWS/IAM/CORS — ผู้ใช้เลือกเปลี่ยนจาก S3 แล้ว |
| CSS | Tailwind v4 (ใช้อยู่แล้ว) | คง pattern `--fs-d` เดิม |
| Print | react-to-print (ใช้อยู่แล้ว) | ทำงานฝั่ง client ย้ายมาได้เลย |

## 3. สถานะโค้ดปัจจุบัน (Vite SPA — ก่อน migrate)

```
src/
  App.tsx                    # Toolbar (สลับภาษา + ปุ่ม print) + ครอบ ResumePage
  components/ResumePage.tsx  # หน้า resume A4 + auto-fit scale + ปุ่มปรับฟ้อนต์ + ลากปรับคอลัมน์
  components/Header.tsx      # หัว resume (ชื่อ รูป contact)
  components/sections.tsx    # Profile, TechStack, Recognition, Experience, Education, Projects
  components/SectionTitle.tsx
  context/language.tsx       # LanguageProvider (en/th)
  i18n/index.ts              # เนื้อหา resume ทั้งสองภาษา (hardcoded) + contact
  i18n/types.ts              # interface ResumeContent — สำคัญ: ใช้เป็นฐาน schema JSON + Zod
  index.css                  # Tailwind v4 @theme (--color-navy, fonts) + print CSS
```

### Feature ที่ทำไว้แล้วใน ResumePage.tsx — ต้องรักษาไว้ตอน migrate

1. **ปรับขนาดฟ้อนต์** — ปุ่มลอยมุมล่างขวา (`A−` / readout+reset / `A+`) step ละ 0.5px **ไม่มี limit**
   - กลไก: CSS var `--fs-d` เซ็ตที่ root ของ resume; ทุก font-size ในทุก component เป็น
     `text-[calc(<base>px+var(--fs-d,0px))]` (รวม line-height แบบ px ของ chip/status ด้วย)
2. **ลากปรับความกว้างคอลัมน์ซ้าย-ขวา** — divider ระหว่าง aside/main, pointer capture,
   clamp 18–45%, มี grip pill (`GripVertical`) + hover/drag highlight, ทั้งหมด `print:hidden`
   เหลือเส้น 1px ตอนพิมพ์
3. **Auto-fit A4** — `useLayoutEffect` วัดความสูงเนื้อหาแล้วย่อ `scale` ให้พอดี 1 หน้า A4
   - **บั๊กที่เคยเจอและแก้แล้ว ห้าม regress:** ตอนวัดต้อง neutralize style เดิมก่อน
     (`minHeight=0, transform=none, width=100%, --fs-d=0px`) แล้วค่อย restore —
     ถ้าวัดโดยรวม font delta เข้าไป auto-fit จะหักล้างการปรับฟ้อนต์จนดูกลับทิศ
     (กดเพิ่มแล้วเล็กลง) และ minHeight ที่พองไว้จะทำให้ scale ไม่ยอมขยายกลับ
   - dependency ของ effect: `[lang, leftPct]` — **จงใจไม่มี fontDelta**
4. i18n en/th ผ่าน context, `html[lang="th"]` มี CSS override letter-spacing (class `.tracked`)

## 4. Data model

Hybrid: ownership/metadata เป็น relational, เนื้อหา resume เป็น JSONB (มันคือ document ที่โหลด/render ทั้งก้อน ไม่ query ข้าม record)

```prisma
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pooled (-pooler) — ให้แอปใช้ตอน runtime
  directUrl = env("DIRECT_URL")     // direct — ให้ prisma migrate ใช้
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
  resumes   Resume[]
  accounts  Account[]
  sessions  Session[]
}

model Resume {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  slug        String    @unique          // nanoid; MVP ใช้ /r/[slug] (username claim = ทีหลัง)
  title       String    @default("My Resume")
  content     Json      // draft ที่กำลังแก้ — รูปทรง = ResumeContent (จาก src/i18n/types.ts)
  published   Json?     // snapshot เวอร์ชันสาธารณะ; null = ยังไม่เคย publish
  config      Json      // { fontDelta: number, leftPct: number, lang: "en"|"th", photoUrl?: string }
  isPublic    Boolean   @default(false)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId])
}

// + Account / Session / VerificationToken ตาม Auth.js Prisma adapter มาตรฐาน
```

หมายเหตุ:
- `config` อยู่ใน DB (ไม่ใช่ localStorage) เพราะเป็นส่วนหนึ่งของ resume ที่เจ้าของเซฟ — แต่ตอน **guest ดู** หน้า public การปรับฟ้อนต์/คอลัมน์ของ guest เป็นแค่ชั่วคราวฝั่ง client ไม่เขียน DB
- สองภาษา: `ResumeContent` เดิมเป็น per-language อยู่แล้ว — ให้ `content` เก็บ `{ en: ResumeContent, th: ResumeContent }` หรือเก็บภาษาเดียวตามที่ผู้ใช้สร้าง (ตัดสินใจตอนทำ Phase 2 — ถามผู้ใช้ว่า resume ใหม่ของคนอื่นต้อง bilingual ไหม; ของเจ้าของเดิมเป็น bilingual)
- Zod schema เขียน mirror จาก `ResumeContent` ไว้ที่ `src/lib/schema.ts` ใช้ validate ทุก save

## 5. โครง Next.js ที่ตั้งใจไว้

```
app/
  layout.tsx
  page.tsx                    # landing (MVP: redirect ไป /dashboard หรือหน้าแนะนำสั้นๆ)
  r/[slug]/page.tsx           # หน้า public (Server Component; อ่าน published เท่านั้น + isPublic)
  dashboard/page.tsx          # รายการ resume ของ user + ปุ่มสร้างใหม่
  editor/[id]/page.tsx        # inline editor (client; เช็ค ownership ฝั่ง server ก่อน render)
  api/auth/[...nextauth]/route.ts
  api/upload/route.ts         # handleUpload ของ Vercel Blob (ดู §7)
components/
  resume/ResumeView.tsx       # **presentational ตัวเดียว** ใช้ทั้ง public/editor/preview
  resume/EditableText.tsx     # primitive: view=<span>, edit=<textarea auto-grow> typography เดิมเป๊ะ
  ...sections แยกไฟล์ตามเดิม
lib/
  db.ts                       # PrismaClient + PrismaNeon adapter (singleton กัน hot-reload)
  auth.ts                     # Auth.js config
  schema.ts                   # Zod schemas (ResumeContent, ResumeConfig)
actions/
  resume.ts                   # Server Actions: create/updateDraft/publish/unpublish/delete
```

หลักการสำคัญ: **`<ResumeView content config editable>` ตัวเดียว** — หน้า public ป้อน `published` (read-only), editor ป้อน `content` (editable) → preview ตรงกับของจริงเสมอ

## 6. Inline editor (สิ่งที่ผู้ใช้ต้องการเจาะจง)

- **ห้ามใช้ `contentEditable` ดิบทุกช่อง** (cursor เด้ง / paste เละ / sanitize ยาก)
  ใช้ `<EditableText>`: คลิก span → สลับเป็น textarea ที่ class typography เหมือน view เป๊ะ
  (รวม `text-[calc(...+var(--fs-d,0px))]`), blur/Enter → กลับเป็น span
- List (experience/projects/bullets/tech chips): hover โผล่ drag handle (dnd-kit) + ปุ่มเพิ่ม/ลบ
- **Autosave draft** debounce ~1s ผ่าน Server Action + indicator "กำลังบันทึก…/บันทึกแล้ว"
- ปุ่ม **Publish** แยกชัดเจน = copy `content` → `published`, set `publishedAt`, `isPublic=true`
- การปรับฟ้อนต์/คอลัมน์ในโหมด editor = แก้ `config` แล้ว autosave ด้วย
- Mobile editor: แตะ field แก้ได้เลย; ทดสอบ dnd-kit บน touch จริงจัง

## 7. อัพโหลดรูปผ่าน Vercel Blob

> เดิมวางแผนเป็น AWS S3 + presigned URL แต่ผู้ใช้เลือกเปลี่ยนเป็น Vercel Blob (2026-07-18) เพราะง่ายกว่า — ไม่ต้องมี AWS account/IAM/CORS เลย

Flow แบบ **client upload** (อัพตรงจาก browser เข้า Blob store — ไม่ proxy ไฟล์ผ่าน function, เลี่ยง body limit 4.5MB):

1. Client: `upload(filename, file, { access: "public", handleUploadUrl: "/api/upload" })` จาก `@vercel/blob/client`
2. Server (`app/api/upload/route.ts` ใช้ `handleUpload` จาก `@vercel/blob/client`):
   - `onBeforeGenerateToken`: **เช็ค session + ownership ของ resumeId** แล้วจำกัด
     `allowedContentTypes: ["image/jpeg","image/png","image/webp"]`, `maximumSizeInBytes: 5MB`,
     `addRandomSuffix: true`, pathname ใต้ `users/{userId}/{resumeId}/`
   - `onUploadCompleted`: ลบ blob รูปเก่าด้วย `del(oldUrl)` (best-effort) —
     **ข้อจำกัด: callback นี้ไม่ยิงบน localhost** ต้องเทสต์บน preview deployment หรือใช้ tunnel
3. Client ได้ blob URL (`https://<store>.public.blob.vercel-storage.com/...`) → เซฟลง `config.photoUrl` ผ่าน autosave ปกติ
4. แสดงผลด้วย `next/image` — ใส่ `images.remotePatterns` สำหรับ `*.public.blob.vercel-storage.com` ใน `next.config.ts`

Setup ครั้งเดียว: สร้าง Blob store ใน Vercel dashboard แล้วผูกกับโปรเจกต์ → `BLOB_READ_WRITE_TOKEN` ถูกเซ็ตให้อัตโนมัติ; local dev ใช้ `vercel env pull`

แนะนำเพิ่ม: **บีบ/resize รูปฝั่ง client ก่อนอัพ** (เช่น `browser-image-compression` หรือ canvas — รูปโปรไฟล์ไม่จำเป็นต้องเกิน ~512×512) ประหยัด storage/bandwidth และโหลดหน้า public เร็วขึ้น

## 8. Security checklist (multi-tenant — ต้องมีตั้งแต่ Phase ที่เกี่ยว)

- [ ] ทุก Server Action / API: `resume.userId === session.user.id` ก่อน mutate เสมอ (ช่องโหว่อันดับ 1)
- [ ] หน้า public อ่านจาก `published` + `isPublic=true` เท่านั้น — draft ห้ามหลุด
- [ ] Zod validate `content`/`config` ทุก save (ทั้งรูปทรงและ limit ความยาว string / จำนวน item)
- [ ] ลิงก์ที่ user กรอก (project links, social): อนุญาตเฉพาะ http/https (กัน `javascript:`)
- [ ] ไม่ render HTML จาก user — text ล้วนผ่าน React escape; ถ้าอนาคตมี rich text ค่อยใส่ DOMPurify
- [ ] Blob upload token: ออกให้เฉพาะ user ที่ login + จำกัด content-type/size ใน `onBeforeGenerateToken` + pathname อยู่ใต้ userId ของตัวเองเท่านั้น
- [ ] Rate limit จุด mutate/upload (เช่น `@upstash/ratelimit` หรือนับใน DB แบบง่ายก่อน)
- [ ] slug จาก nanoid — ห้ามให้ user กำหนดเองใน MVP (กัน enumeration/ชนกัน/คำไม่เหมาะสม)

## 9. Mobile strategy

- **< md:** ทิ้ง A4 fixed → stack คอลัมน์เดียว (Header → aside sections → main sections), ฟ้อนต์อ่านสบาย, scroll ปกติ, **ซ่อน column-drag** (ไม่มีความหมายบน single column), ปุ่มปรับฟ้อนต์ยังใช้ได้
- **≥ md:** กระดาษ A4 + auto-fit เหมือนปัจจุบัน
- **Print:** บังคับ layout A4 เสมอด้วย print CSS (แม้พิมพ์จากมือถือ)
- ระวัง: logic auto-fit ปัจจุบันผูกกับ layout A4 — บน mobile ต้อง**ปิด** auto-fit (ไม่ scale)

## 10. ลำดับงาน (แต่ละ phase จบแล้วต้องรันได้จริง)

### Phase 1 — Migrate Vite → Next.js + แยก ResumeView + mobile (เนื้อหายัง static)
- ตั้ง Next.js App Router + Tailwind v4 (ย้าย `@theme` จาก index.css), ลบ Vite
- แยก `ResumePage` → `<ResumeView>` presentational (รับ content/config เป็น props; state ฟ้อนต์/คอลัมน์/auto-fit ยกไปด้วย **ห้าม regress ข้อ §3**)
- เนื้อหายังมาจาก `src/i18n` เดิม; react-to-print ยังทำงาน
- ทำ mobile responsive ตาม §9
- **DoD:** `npm run build` ผ่าน, desktop เหมือนเดิมทุก feature, mobile อ่านได้จริง, print ได้ A4

### Phase 2 — Neon + Prisma + Auth
- Prisma schema ตาม §4 + Auth.js (Google/GitHub) + Prisma adapter
- `prisma migrate dev` (จำ: `DATABASE_URL` pooled / `DIRECT_URL` direct)
- Seed script: แปลงข้อมูลจาก `src/i18n/index.ts` เป็น resume แรกของเจ้าของ (peerawet1996@gmail.com)
- `/dashboard`: login → เห็นรายการ resume → สร้างใหม่ (จาก template เนื้อหาตัวอย่าง)
- **DoD:** login ได้จริง 2 provider, สร้าง/ลบ resume ได้, หน้า public `/r/[slug]` render จาก `published`

### Phase 3 — Inline editor
- `<EditableText>` + edit ทุก field ใน ResumeView + เพิ่ม/ลบ/reorder list (dnd-kit)
- Autosave draft + Publish/Unpublish + แก้ config (ฟ้อนต์/คอลัมน์) เซฟลง DB
- **DoD:** แก้ inline บน desktop+mobile ได้, refresh แล้ว draft อยู่, guest ยังเห็นเวอร์ชันเก่าจนกด publish

### Phase 4 — Upload รูป (Vercel Blob) + hardening
- ตาม §7 ทั้ง flow + ตาม checklist §8 ให้ครบ
- **DoD:** อัพรูปจากมือถือ/desktop ได้, รูปขึ้นทั้ง editor และหน้า public, ยิง API ข้าม user แล้วโดนปฏิเสธ (เทสต์ `onUploadCompleted` บน preview deployment เพราะ localhost ไม่ยิง callback)

### Phase 5 — Polish (คุยกับผู้ใช้ก่อนเริ่ม)
- ตัวเลือก: PDF export server-side, หลาย template, landing page, username claim, ลบรูป orphan

## 11. Env vars

```
DATABASE_URL=            # Neon pooled (มี -pooler)
DIRECT_URL=              # Neon direct
AUTH_SECRET=
AUTH_TRUST_HOST=true     # จำเป็นเมื่อ self-host/next start; Vercel เซ็ตให้อัตโนมัติ
AUTH_GOOGLE_ID= / AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID= / AUTH_GITHUB_SECRET=
BLOB_READ_WRITE_TOKEN=   # เซ็ตอัตโนมัติเมื่อผูก Blob store กับโปรเจกต์; local ใช้ `vercel env pull`
```

## 12. คำถามที่ยังเปิดอยู่ (ถามผู้ใช้เมื่อถึงจุดนั้น ไม่ต้องเดา)

1. ~~Resume ของ user ใหม่~~ — ตอบแล้ว (Phase 2): `{ en?, th?, contact }` เริ่มภาษาเดียว เพิ่มทีหลังได้
2. ~~Landing page~~ — ตอบแล้ว (2026-07-18): ผู้ใช้เลือก **หน้าโปรโมท SaaS** — ทำแล้วที่ `/` (hero + features + CTA ไป /dashboard + ลิงก์ตัวอย่างดึง slug เจ้าของจาก DB แบบ try/catch, ISR 1 ชม.) ส่วน resume เจ้าของอยู่ที่ `/r/[slug]` อย่างเดียว
3. ชื่อ product / โดเมน? — ยังเปิดอยู่ (ตอนนี้ใช้ชื่อกลาง "Resume Builder")

## 13. ข้อแนะนำการทำงาน (ไม่บังคับ แต่ช่วยได้จริง)

- **อย่าพัง resume ปัจจุบัน**: เว็บเดิม deploy อยู่ (มี `scripts/deploy.ps1`) — ทำ SaaS บน branch ใหม่ (เช่น `saas`) แล้วค่อย merge เมื่อ Phase 1–2 ใช้ได้จริง ระหว่างนั้น resume เดิมยังออนไลน์ตามปกติ
- **Neon branching**: สร้าง DB branch แยก dev/prod (Neon ทำได้ฟรีในตัว) — dev ทดลอง migrate พังได้โดยไม่แตะ prod; ถ้าอยากหรูขึ้น ผูก branch ต่อ Vercel preview ทีหลัง
- **Migration บน prod**: ใช้ `prisma migrate deploy` ใน build/CI (ไม่ใช่ `migrate dev`) — กำหนดใน build command ของ Vercel หรือ `postinstall`
- **บีบรูปฝั่ง client ก่อนอัพ** (§7) — ทำตั้งแต่แรก ถูกกว่ามาแก้ทีหลัง
- **เช็คของฟรีก่อนจ่าย**: Neon free tier + Vercel Hobby + Blob free tier พอสำหรับช่วง build + ผู้ใช้กลุ่มแรกทั้งหมด ยังไม่ต้องคิดเรื่อง cost จนกว่าจะมีผู้ใช้จริง
