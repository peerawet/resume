import "server-only";
import { del, list } from "@vercel/blob";

/**
 * ลบ blob รูปเก่าแบบ best-effort (plan §7) — ทำฝั่ง server action ตอน save/publish
 * แทน onUploadCompleted เพราะ callback นั้นไม่ยิงบน localhost
 * ทุกฟังก์ชัน try/catch เงียบ: ลบไม่สำเร็จ (เช่น ยังไม่มี BLOB token ตอน dev)
 * ต้องไม่ทำให้ flow หลักพัง — อย่างแย่แค่มี blob orphan
 */

/** เช็คว่า url เป็น blob ของ resume นี้จริง (host ของ Vercel Blob + prefix ตรง) */
export function isResumeBlobUrl(url: string, resumeId: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.endsWith(".public.blob.vercel-storage.com") &&
      decodeURIComponent(parsed.pathname).startsWith(`/resumes/${resumeId}/`)
    );
  } catch {
    return false;
  }
}

/**
 * ลบ blob เดิมของ resume ถ้าไม่มีเอกสารไหน (draft ใหม่/published) อ้างถึงแล้ว
 * เช็คด้วย JSON.stringify ตรงๆ — หยาบแต่พอ: URL มี random suffix ไม่ชนกับ text อื่น
 */
export async function deleteResumeBlobIfUnused(
  url: string | undefined,
  resumeId: string,
  stillReferenced: unknown[],
): Promise<void> {
  if (!url || !isResumeBlobUrl(url, resumeId)) return;
  const haystack = JSON.stringify(stillReferenced ?? []);
  if (haystack.includes(url)) return;
  try {
    await del(url);
  } catch {
    // best-effort
  }
}

/** ลบ blob ทั้งหมดของ resume — เรียกตอนลบ resume ทิ้ง */
export async function deleteAllResumeBlobs(resumeId: string): Promise<void> {
  try {
    const { blobs } = await list({ prefix: `resumes/${resumeId}/` });
    if (blobs.length) await del(blobs.map((b) => b.url));
  } catch {
    // best-effort
  }
}
