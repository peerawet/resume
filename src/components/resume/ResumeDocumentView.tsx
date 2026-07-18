"use client";

import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Pencil, Printer, X } from "lucide-react";
import ResumeView from "./ResumeView";
import type { EditableDraft } from "./editing";
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
  // โหมด "ลองแก้ไข": guest แก้ inline ได้บนสำเนาฝั่ง client เท่านั้น —
  // ไม่มี autosave/ไม่แตะ DB, จบการแก้ไข/รีเฟรชแล้วกลับเป็นเวอร์ชันจริง
  const [draft, setDraft] = useState<ResumeDocument | null>(null);
  const editing = draft !== null;

  const startEditing = () => {
    const clone = structuredClone(doc);
    // resolve รูป legacy จาก config เข้า draft ให้แผงปรับรูปทำงานกับรูปจริง
    if (!clone.contact.photo && config?.photoUrl) {
      clone.contact.photo = config.photoUrl;
    }
    setDraft(clone);
  };

  const update = (recipe: (d: EditableDraft) => void) =>
    setDraft((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      const content = next[lang];
      if (!content) return prev;
      recipe({ content, contact: next.contact });
      return next;
    });

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

  const activeDoc = draft ?? doc;
  const content = activeDoc[lang] ?? activeDoc[available[0]?.code ?? "en"];
  if (!content) return null;

  // contact.photo คือที่เก็บหลักตั้งแต่ Phase 4 — config.photoUrl เป็น fallback
  // ของข้อมูลเก่าที่ยังไม่ถูก resave/republish
  const contact = {
    ...activeDoc.contact,
    photo: activeDoc.contact.photo ?? config?.photoUrl,
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-200 pb-20 pt-16 md:py-10 print:bg-white print:py-0">
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 print:hidden">
        {editing ? (
          <>
            <span className="rounded-md bg-amber-100 px-2.5 py-2 text-xs font-semibold text-amber-800 shadow-sm">
              ไม่ถูกบันทึก
            </span>
            <button
              onClick={() => setDraft(null)}
              title="ทิ้งการแก้ไขทั้งหมด กลับเป็นเวอร์ชันจริง"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-100"
            >
              <X size={15} /> จบการแก้ไข
            </button>
          </>
        ) : (
          <button
            onClick={startEditing}
            title="ทดลองแก้เนื้อหาบนเครื่องคุณ — ไม่มีอะไรถูกบันทึก"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-100"
          >
            <Pencil size={14} /> ลองแก้ไข
          </button>
        )}
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
          key={editing ? `edit-${lang}` : `view-${lang}`}
          content={content}
          contact={contact}
          config={{ fontDelta: config?.fontDelta, leftPct: config?.leftPct }}
          editable={editing}
          onUpdate={editing ? update : undefined}
        />
      </div>
    </div>
  );
}
