"use client";

import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import ResumeView from "./ResumeView";
import type { Language } from "@/i18n/types";
import type { ResumeConfig, ResumeDocument } from "@/lib/schema";

const LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "th", label: "ไทย" },
];

interface ResumeDocumentViewProps {
  doc: ResumeDocument;
  config?: Partial<ResumeConfig>;
  documentTitle?: string;
}

/**
 * Shell ฝั่ง client ของ resume หนึ่งฉบับ: สลับภาษา (เฉพาะภาษาที่มีใน doc),
 * ปุ่ม print และ <ResumeView> — ใช้ทั้งหน้า landing (static) และ /r/[slug]
 * การปรับฟ้อนต์/คอลัมน์ของ guest เป็นแค่ state ชั่วคราวฝั่ง client
 */
export default function ResumeDocumentView({
  doc,
  config,
  documentTitle,
}: ResumeDocumentViewProps) {
  const available = LANGS.filter((option) => doc[option.code]);
  const [lang, setLang] = useState<Language>(() =>
    config?.lang && doc[config.lang] ? config.lang : available[0]?.code ?? "en",
  );

  // คงพฤติกรรมเดิม: เปิดด้วย #th ได้ (อ่านหลัง mount กัน hydration mismatch)
  useEffect(() => {
    if (window.location.hash === "#th" && doc.th) setLang("th");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: documentTitle ?? "Resume",
  });

  const content = doc[lang] ?? doc[available[0]?.code ?? "en"];
  if (!content) return null;

  const contact = {
    ...doc.contact,
    photo: config?.photoUrl ?? doc.contact.photo,
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-200 pb-20 pt-16 md:py-10 print:bg-white print:py-0">
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 print:hidden">
        {available.length > 1 && (
          <div className="flex overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
            {available.map((option) => (
              <button
                key={option.code}
                onClick={() => setLang(option.code)}
                className={`px-3 py-2 text-sm font-semibold transition-colors ${
                  lang === option.code
                    ? "bg-navy text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => handlePrint()}
          className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-navy/90"
        >
          <Printer size={16} /> {content.ui.print}
        </button>
      </div>

      <div ref={contentRef} className="w-full md:w-auto">
        <ResumeView
          content={content}
          contact={contact}
          config={{ fontDelta: config?.fontDelta, leftPct: config?.leftPct }}
        />
      </div>
    </div>
  );
}
