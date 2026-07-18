"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { defaultConfig } from "@/lib/schema";
import { createStarterDocument } from "@/lib/template";

/** คืน session ที่ login แล้ว — ทุก action ต้องผ่านตัวนี้ก่อน */
async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

/** เช็ค ownership ก่อน mutate เสมอ (plan §8 ข้อแรก) */
async function requireOwnedResume(resumeId: string, userId: string) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== userId) throw new Error("Not found");
  return resume;
}

export async function createResume() {
  const user = await requireUser();
  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      slug: nanoid(10),
      title: "My Resume",
      content: createStarterDocument(),
      config: defaultConfig,
    },
  });
  revalidatePath("/dashboard");
  return { id: resume.id };
}

export async function deleteResume(resumeId: string) {
  const user = await requireUser();
  await requireOwnedResume(resumeId, user.id);
  await prisma.resume.delete({ where: { id: resumeId } });
  revalidatePath("/dashboard");
}

/** copy draft → published แล้วเปิดสาธารณะ */
export async function publishResume(resumeId: string) {
  const user = await requireUser();
  const resume = await requireOwnedResume(resumeId, user.id);
  await prisma.resume.update({
    where: { id: resume.id },
    data: {
      published: resume.content ?? undefined,
      isPublic: true,
      publishedAt: new Date(),
    },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/r/${resume.slug}`);
}

export async function unpublishResume(resumeId: string) {
  const user = await requireUser();
  const resume = await requireOwnedResume(resumeId, user.id);
  await prisma.resume.update({
    where: { id: resume.id },
    data: { isPublic: false },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/r/${resume.slug}`);
}

export async function createResumeAndGo() {
  const { id } = await createResume();
  redirect(`/dashboard?created=${id}`);
}
