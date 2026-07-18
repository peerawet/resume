import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { defaultConfig, type ResumeConfig, type ResumeDocument } from "@/lib/schema";
import Editor from "./editor";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  // เช็ค ownership ฝั่ง server ก่อน render เสมอ — resume คนอื่น = 404 (ไม่บอกใบ้ว่ามีอยู่)
  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== session.user.id) notFound();

  return (
    <Editor
      resume={{
        id: resume.id,
        title: resume.title,
        slug: resume.slug,
        isPublic: resume.isPublic,
        doc: resume.content as ResumeDocument,
        config: { ...defaultConfig, ...(resume.config as Partial<ResumeConfig>) },
      }}
    />
  );
}
