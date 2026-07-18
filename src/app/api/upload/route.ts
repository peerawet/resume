import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Client upload เข้า Vercel Blob (plan §7) — browser อัพตรงเข้า store
 * route นี้แค่ออก token หลังตรวจสิทธิ์ ไม่ proxy ตัวไฟล์ (เลี่ยง body limit 4.5MB)
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // §8: ออก token ให้เฉพาะ user ที่ login และเป็นเจ้าของ resume เท่านั้น
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) throw new Error("Unauthorized");
        if (!rateLimit(`upload:${userId}`, 20, 10 * 60_000)) {
          throw new Error("อัพโหลดถี่เกินไป — รอสักครู่แล้วลองใหม่");
        }

        const { resumeId } = JSON.parse(clientPayload ?? "{}") as {
          resumeId?: string;
        };
        // client เป็นคนตั้ง pathname — server บังคับว่าต้องอยู่ใต้ resume ของตัวเอง
        // (ใช้ prefix resumes/{id}/ เพราะ client ไม่รู้ userId; ownership เช็คจาก DB)
        if (!resumeId || !pathname.startsWith(`resumes/${resumeId}/`)) {
          throw new Error("Invalid pathname");
        }
        const resume = await prisma.resume.findUnique({
          where: { id: resumeId },
          select: { userId: true },
        });
        if (!resume || resume.userId !== userId) throw new Error("Not found");

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId, resumeId }),
        };
      },
      // การผูก URL เข้า draft + ลบรูปเก่า ทำผ่าน autosave/server action แล้ว
      // (callback นี้ไม่ยิงบน localhost — อย่าเอา logic สำคัญมาไว้ที่นี่)
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
