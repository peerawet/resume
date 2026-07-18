/**
 * บีบ/ย่อรูปฝั่ง client ก่อนอัพโหลด (plan §7) — รูปโปรไฟล์ไม่จำเป็นต้องเกิน 512px
 * ประหยัด storage/bandwidth และหน้า public โหลดเร็วขึ้น
 */

const MAX_DIM = 512;

async function decodeImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap จัดการ EXIF orientation ให้ (default: from-image)
  try {
    return await createImageBitmap(file);
  } catch {
    // fallback เบราว์เซอร์เก่า/ฟอร์แมตที่ createImageBitmap ไม่รับ
    const url = URL.createObjectURL(file);
    try {
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("decode failed"));
        img.src = url;
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

export interface CompressedPhoto {
  blob: Blob;
  contentType: string;
  ext: string;
}

/** ย่อรูปให้ด้านยาวสุดไม่เกิน 512px แล้วเข้ารหัสเป็น webp (fallback jpeg) */
export async function compressPhoto(file: File): Promise<CompressedPhoto> {
  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await decodeImage(file);
  } catch {
    throw new Error("ไฟล์นี้ไม่ใช่รูปภาพที่เบราว์เซอร์รองรับ (ลอง JPG/PNG/WebP)");
  }

  const width = "naturalWidth" in source ? source.naturalWidth : source.width;
  const height = "naturalHeight" in source ? source.naturalHeight : source.height;
  if (!width || !height) throw new Error("อ่านขนาดรูปไม่ได้");

  const scale = Math.min(1, MAX_DIM / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("สร้าง canvas ไม่ได้");
  // พื้นขาวรองไว้ก่อน — ถ้าต้อง fallback เป็น jpeg ส่วนโปร่งใสจะได้ไม่กลายเป็นดำ
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ("close" in source) source.close();

  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));

  const webp = await encode("image/webp");
  if (webp?.type === "image/webp") {
    return { blob: webp, contentType: "image/webp", ext: "webp" };
  }
  const jpeg = await encode("image/jpeg");
  if (jpeg?.type === "image/jpeg") {
    return { blob: jpeg, contentType: "image/jpeg", ext: "jpg" };
  }
  throw new Error("แปลงรูปไม่สำเร็จ");
}
