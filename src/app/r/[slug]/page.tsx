import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ResumeDocumentView from "@/components/resume/ResumeDocumentView";
import type { ResumeConfig, ResumeDocument } from "@/lib/schema";

// หน้า public: อ่านจาก `published` + `isPublic=true` เท่านั้น — draft ห้ามหลุด (plan §8)
const getPublicResume = cache(async (slug: string) => {
  const resume = await prisma.resume.findUnique({
    where: { slug },
    select: { title: true, published: true, isPublic: true, config: true },
  });
  if (!resume?.isPublic || !resume.published) return null;
  return resume;
});

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const resume = await getPublicResume(slug);
  if (!resume) return { title: "Resume not found" };
  const doc = resume.published as ResumeDocument;
  const name = (doc.en ?? doc.th)?.personal.name;
  return { title: name ? `${name} — Resume` : resume.title };
}

export default async function PublicResumePage({ params }: PageProps) {
  const { slug } = await params;
  const resume = await getPublicResume(slug);
  if (!resume) notFound();

  const doc = resume.published as ResumeDocument;
  const config = resume.config as ResumeConfig;

  return (
    <ResumeDocumentView
      doc={doc}
      config={config}
      documentTitle={resume.title.replace(/\s+/g, "_")}
    />
  );
}
