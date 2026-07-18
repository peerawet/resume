/**
 * E2E Phase 4 — photo UI (ขนาด/ซูม/ลากจัดตำแหน่ง) + upload hardening
 * รัน: npx tsx --env-file=.env <ไฟล์นี้>  (dev server ต้องรันที่ :3777 ก่อน)
 *
 * ใช้ user ทดสอบสมัครใหม่ผ่าน UI แล้วลบทิ้งจาก DB ตอนจบ — ไม่แตะข้อมูลเจ้าของ
 * upload จริงเข้า Blob ยังทดสอบไม่ได้ (ไม่มี BLOB_READ_WRITE_TOKEN) —
 * ทดสอบ error path + การปฏิเสธ token ข้าม user แทน
 */
import { chromium, type Locator, type Page } from "playwright";
import { PrismaClient } from "@prisma/client";

const BASE = "http://localhost:3000";
const EMAIL = `e2e-photo-${Date.now()}@example.com`;
const PASSWORD = "test-password-1234";

const prisma = new PrismaClient();

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    passed++;
    console.log(`  PASS ${name}`);
  } else {
    failed++;
    console.log(`  FAIL ${name} ${detail}`);
  }
}

async function waitSaved(page: Page) {
  await page.waitForTimeout(300); // ให้ state เปลี่ยนเป็น "รอบันทึก…" ก่อน
  await page.getByText("บันทึกแล้ว").waitFor({ timeout: 10_000 });
}

/** set ค่า input[type=range] แบบที่ React onChange เห็น (native setter + input event) */
async function setRange(slider: Locator, value: string) {
  await slider.evaluate((el, v) => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    setter.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(15_000);

  // --- สมัคร user ทดสอบ ---
  await page.goto(`${BASE}/signup`);
  await page.fill('input[name="name"]', "E2E Photo");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.fill('input[name="confirm"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
  check("signup → dashboard", true);

  // --- สร้าง resume แล้วเข้า editor ---
  await page.click("text=สร้าง resume ใหม่");
  await page.waitForURL("**/editor/**");
  const resumeId = page.url().split("/editor/")[1];
  check("create resume → editor", Boolean(resumeId));

  // --- T1: placeholder รูป + คลิกเปิดแผง ---
  const photoButton = page.locator('span[role="button"][title*="ปรับแต่งรูป"]');
  await photoButton.waitFor();
  await photoButton.click();
  await page.getByText("อัพโหลดรูป").waitFor();
  check("photo panel opens", true);
  const sizeSlider = page.locator('input[type="range"]').nth(0);
  const zoomSlider = page.locator('input[type="range"]').nth(1);
  check("zoom disabled without photo", await zoomSlider.isDisabled());

  // --- T2: ปรับขนาดกรอบ → กรอบเปลี่ยน + autosave ---
  await setRange(sizeSlider, "140");
  const frame = photoButton.locator("> span").first();
  const w = await frame.evaluate((el) => (el as HTMLElement).style.width);
  check("size slider resizes frame", w === "140px", `got ${w}`);
  await waitSaved(page);

  // --- T3: จำลองมีรูป (photo = /photo.jpg ใน DB) แล้วรีโหลด ---
  const before = await prisma.resume.findUniqueOrThrow({ where: { id: resumeId } });
  const doc = before.content as { contact: Record<string, unknown> };
  check("photoSize persisted", doc.contact.photoSize === 140, String(doc.contact.photoSize));
  doc.contact.photo = "/photo.jpg";
  await prisma.resume.update({ where: { id: resumeId }, data: { content: doc } });
  await page.reload();
  await photoButton.waitFor();
  const img = photoButton.locator("img");
  check("photo renders after reload", (await img.count()) === 1);

  // --- T4: ซูม + ลากจัดตำแหน่ง ---
  await photoButton.click();
  await setRange(zoomSlider, "2");
  const transform1 = await img.evaluate((el) => (el as HTMLElement).style.transform);
  check("zoom applies transform", transform1.includes("scale(2)"), transform1);
  await waitSaved(page);
  const box = (await photoButton.boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 30, cy + 20, { steps: 5 });
  await page.mouse.up();
  const transform2 = await img.evaluate((el) => (el as HTMLElement).style.transform);
  check(
    "drag pans photo",
    !transform2.includes("translate(0%, 0%)") && transform2.includes("scale(2)"),
    transform2,
  );
  await waitSaved(page);
  const after = await prisma.resume.findUniqueOrThrow({ where: { id: resumeId } });
  const contact = (after.content as { contact: Record<string, unknown> }).contact;
  check(
    "zoom+pan persisted",
    contact.photoZoom === 2 && typeof contact.photoX === "number" && contact.photoX !== 0,
    JSON.stringify(contact),
  );

  // --- T5: pan ถูก clamp ไม่หลุดขอบ (ลากไกลๆ) ---
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 600, cy, { steps: 5 });
  await page.mouse.up();
  const transform3 = await img.evaluate((el) => (el as HTMLElement).style.transform);
  const xMatch = /translate\((-?[\d.]+)%/.exec(transform3);
  check(
    "pan clamped to zoom bound",
    Boolean(xMatch) && Math.abs(Number(xMatch![1])) <= 50.01,
    transform3,
  );
  await waitSaved(page);

  // --- T6: อัพโหลดโดยไม่มี BLOB token → error โชว์ใน UI (flow ไม่พัง) ---
  const panelOpen = await page.getByText("อัพโหลดรูป").isVisible().catch(() => false);
  if (!panelOpen) await photoButton.click();
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVR4nGP8z8Dwn4EIwESMolGFlCsEAK5cAxHkNRP3AAAAAElFTkSuQmCC",
    "base64",
  );
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: "test.png", mimeType: "image/png", buffer: png });
  await page
    .locator("span.text-red-600, span.block.text-red-600")
    .first()
    .waitFor({ timeout: 20_000 });
  const errMsg = await page.locator("span.text-red-600").first().textContent();
  check("upload without token shows error", true, errMsg ?? "");
  console.log(`  (error message: ${errMsg})`);

  // --- T7: publish → guest เห็นรูปพร้อม transform/ขนาด ---
  await page.click("text=Publish");
  let published = false;
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    const row = await prisma.resume.findUniqueOrThrow({ where: { id: resumeId } });
    if (row.isPublic && row.published) {
      published = true;
      break;
    }
  }
  check("published + isPublic", published);
  const slugRow = await prisma.resume.findUniqueOrThrow({ where: { id: resumeId } });
  const guest = await browser.newPage();
  await guest.goto(`${BASE}/r/${slugRow.slug}`);
  const guestImg = guest.locator("header img");
  await guestImg.waitFor();
  const guestTransform = await guestImg.evaluate((el) => (el as HTMLElement).style.transform);
  const guestW = await guestImg.evaluate(
    (el) => (el.parentElement as HTMLElement).style.width,
  );
  check(
    "guest sees zoomed/panned photo at custom size",
    guestTransform.includes("scale(2)") && guestW === "140px",
    `${guestTransform} / ${guestW}`,
  );
  check(
    "guest has no photo editor",
    (await guest.locator('span[role="button"][title*="ปรับแต่งรูป"]').count()) === 0,
  );
  await guest.close();

  // --- T8: API hardening ---
  const anon = await browser.newContext();
  const anonPage = await anon.newPage();
  const tokenBody = (rid: string) => ({
    type: "blob.generate-client-token",
    payload: {
      pathname: `resumes/${rid}/photo.webp`,
      callbackUrl: `${BASE}/api/upload`,
      clientPayload: JSON.stringify({ resumeId: rid }),
      multipart: false,
    },
  });
  const anonRes = await anonPage.request.post(`${BASE}/api/upload`, {
    data: tokenBody(resumeId),
  });
  const anonBody = await anonRes.text();
  check(
    "anon token request rejected (Unauthorized)",
    anonRes.status() === 400 && anonBody.includes("Unauthorized"),
    `status ${anonRes.status()} ${anonBody.slice(0, 120)}`,
  );
  await anon.close();

  const owner = await prisma.resume.findFirst({
    where: { user: { email: "peerawet1996@gmail.com" } },
    select: { id: true },
  });
  if (owner) {
    const crossRes = await page.request.post(`${BASE}/api/upload`, {
      data: tokenBody(owner.id),
    });
    const crossBody = await crossRes.text();
    check(
      "cross-user token request rejected (Not found)",
      crossRes.status() === 400 && crossBody.includes("Not found"),
      `status ${crossRes.status()} ${crossBody.slice(0, 120)}`,
    );
    const badPathRes = await page.request.post(`${BASE}/api/upload`, {
      data: {
        type: "blob.generate-client-token",
        payload: {
          pathname: `resumes/${owner.id}/photo.webp`,
          callbackUrl: `${BASE}/api/upload`,
          clientPayload: JSON.stringify({ resumeId }),
          multipart: false,
        },
      },
    });
    const badPathBody = await badPathRes.text();
    check(
      "mismatched pathname rejected (Invalid pathname)",
      badPathRes.status() === 400 && badPathBody.includes("Invalid pathname"),
      `status ${badPathRes.status()} ${badPathBody.slice(0, 120)}`,
    );
  } else {
    check("cross-user token request rejected", false, "owner resume not found");
    check("mismatched pathname rejected", false, "owner resume not found");
  }

  // --- T9: ลบรูป → กลับเป็น placeholder ---
  await page.bringToFront();
  let removeVisible = await page
    .locator('button[title="ลบรูป"]')
    .isVisible()
    .catch(() => false);
  if (!removeVisible) {
    await photoButton.click();
    removeVisible = await page.locator('button[title="ลบรูป"]').isVisible();
  }
  check("remove button visible", removeVisible);
  await page.click('button[title="ลบรูป"]');
  await page.waitForTimeout(200);
  check("remove photo → placeholder", (await photoButton.locator("img").count()) === 0);
  await waitSaved(page);

  await browser.close();

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.user.deleteMany({ where: { email: EMAIL } });
    await prisma.$disconnect();
    console.log("cleanup: test user deleted");
  });
