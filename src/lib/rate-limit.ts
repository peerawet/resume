/**
 * Rate limit แบบ sliding window ใน memory (plan §8 — "นับแบบง่ายก่อน")
 *
 * ข้อจำกัด: บน serverless นับแยกต่อ instance — ยังกันการยิงถี่ๆ จาก client เดิม
 * ได้จริงเพราะ request ต่อเนื่องมักลง instance เดิม แต่ไม่ใช่กำแพงสมบูรณ์
 * ถ้ามีผู้ใช้จริงค่อยย้ายไป @upstash/ratelimit
 */

const windows = new Map<string, number[]>();

/** คืน true = อนุญาต, false = เกินโควต้า */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (windows.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    windows.set(key, hits);
    return false;
  }
  hits.push(now);
  windows.set(key, hits);
  // กัน map โตไม่จำกัดจาก key ที่ไม่ active แล้ว
  if (windows.size > 10_000) {
    for (const [k, v] of windows) {
      if (v.every((t) => now - t >= windowMs)) windows.delete(k);
    }
  }
  return true;
}
