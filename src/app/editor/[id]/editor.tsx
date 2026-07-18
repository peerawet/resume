"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { ArrowLeft, ExternalLink, Globe, Plus, Save } from "lucide-react";
import ResumeView from "@/components/resume/ResumeView";
import type { EditableDraft } from "@/components/resume/editing";
import type { Language } from "@/i18n/types";
import type { ResumeConfig, ResumeDocument } from "@/lib/schema";
import { publishResume, unpublishResume, updateDraft } from "@/actions/resume";

type SaveState = "saved" | "dirty" | "saving" | "error";

const SAVE_LABEL: Record<SaveState, string> = {
  saved: "บันทึกแล้ว",
  dirty: "ยังไม่ได้บันทึก",
  saving: "กำลังบันทึก…",
  error: "บันทึกไม่สำเร็จ — ลองกดบันทึกอีกครั้ง",
};

interface EditorProps {
  resume: {
    id: string;
    title: string;
    slug: string;
    isPublic: boolean;
    doc: ResumeDocument;
    config: ResumeConfig;
  };
}

export default function Editor({ resume }: EditorProps) {
  // migrate ข้อมูลเก่า: รูปที่เคยเก็บใน config.photoUrl ย้ายเข้า contact.photo
  // (ที่เก็บจริงตั้งแต่ Phase 4 — ติดไปกับ snapshot ตอน publish) แล้ว persist เมื่อ autosave แรก
  const [doc, setDoc] = useState(() => {
    if (resume.config.photoUrl && !resume.doc.contact.photo) {
      return {
        ...resume.doc,
        contact: { ...resume.doc.contact, photo: resume.config.photoUrl },
      };
    }
    return resume.doc;
  });
  const [config, setConfig] = useState(() => {
    const { photoUrl: _legacy, ...rest } = resume.config;
    return rest as ResumeConfig;
  });
  const [title, setTitle] = useState(resume.title);
  const [isPublic, setIsPublic] = useState(resume.isPublic);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lang, setLang] = useState<Language>(() =>
    resume.doc[resume.config.lang] ? resume.config.lang : resume.doc.en ? "en" : "th",
  );
  const [publishing, startPublishing] = useTransition();

  // อ้าง state ล่าสุดตอน save โดยไม่ผูก dependency
  const stateRef = useRef({ doc, config, title });
  stateRef.current = { doc, config, title };
  const saveSeq = useRef(0);
  // snapshot ไว้เทียบ identity — กัน StrictMode รัน effect ซ้ำตอน mount แล้ว mark dirty ผิดๆ
  const lastSeen = useRef({ doc, config, title });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const save = useCallback(async () => {
    const seq = ++saveSeq.current;
    setSaveState("saving");
    try {
      await updateDraft(resume.id, stateRef.current);
      if (seq === saveSeq.current) setSaveState("saved");
      return true;
    } catch {
      if (seq === saveSeq.current) setSaveState("error");
      return false;
    }
  }, [resume.id]);

  // ไม่มี autosave (ผู้ใช้เลือกกดบันทึกเอง 2026-07-18) — แค่ mark dirty ให้รู้ว่าค้างอยู่
  useEffect(() => {
    const last = lastSeen.current;
    if (last.doc === doc && last.config === config && last.title === title) return;
    lastSeen.current = { doc, config, title };
    setSaveState("dirty");
  }, [doc, config, title]);

  // Ctrl/Cmd+S = บันทึก (แทน save-page ของเบราว์เซอร์)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (saveState === "dirty" || saveState === "error") void save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save, saveState]);

  // เตือนก่อนปิดแท็บถ้ายังเซฟไม่เสร็จ
  useEffect(() => {
    if (saveState === "saved") return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveState]);

  /** mutate draft ของภาษาที่กำลังแก้ (clone ก่อนเสมอ) */
  const update = useCallback(
    (recipe: (draft: EditableDraft) => void) => {
      setDoc((prev) => {
        const next = structuredClone(prev);
        const content = next[lang];
        if (!content) return prev;
        recipe({ content, contact: next.contact });
        return next;
      });
    },
    [lang],
  );

  const switchLang = (next: Language) => {
    if (!doc[next]) return;
    setLang(next);
    setConfig((prev) => ({ ...prev, lang: next }));
  };

  const addLanguage = (next: Language) => {
    const source = doc[lang];
    if (!source || doc[next]) return;
    setDoc((prev) => ({ ...prev, [next]: structuredClone(source) }));
    setLang(next);
    setConfig((prev) => ({ ...prev, lang: next }));
  };

  const handlePublish = () =>
    startPublishing(async () => {
      if (!(await save())) return; // flush draft ล่าสุดก่อน publish
      try {
        await publishResume(resume.id);
        setIsPublic(true);
      } catch {
        setSaveState("error");
      }
    });

  const handleUnpublish = () =>
    startPublishing(async () => {
      try {
        await unpublishResume(resume.id);
        setIsPublic(false);
      } catch {
        setSaveState("error");
      }
    });

  const content = doc[lang];

  return (
    <div className="flex min-h-screen flex-col bg-slate-200">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-300 bg-white px-4 py-2.5 shadow-sm">
        <Link
          href="/dashboard"
          title="กลับไป dashboard"
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft size={15} />
        </Link>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="ชื่อ resume"
          className="w-40 rounded-md border border-transparent px-2 py-1.5 text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-navy focus:outline-none sm:w-56"
        />

        <div className="flex overflow-hidden rounded-md border border-slate-300">
          {(["en", "th"] as Language[]).map((code) =>
            doc[code] ? (
              <button
                key={code}
                onClick={() => switchLang(code)}
                className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                  lang === code
                    ? "bg-navy text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {code === "en" ? "EN" : "ไทย"}
              </button>
            ) : (
              <button
                key={code}
                onClick={() => addLanguage(code)}
                title={`เพิ่มเวอร์ชันภาษา${code === "th" ? "ไทย" : "อังกฤษ"} (คัดลอกจากภาษาปัจจุบัน)`}
                className="flex items-center gap-0.5 px-2.5 py-1.5 text-sm font-semibold text-slate-400 hover:bg-slate-100 hover:text-navy"
              >
                <Plus size={12} /> {code === "en" ? "EN" : "ไทย"}
              </button>
            ),
          )}
        </div>

        <span
          className={`ml-auto text-xs font-semibold ${
            saveState === "error"
              ? "text-red-600"
              : saveState === "dirty"
                ? "text-amber-600"
                : "text-slate-400"
          }`}
        >
          {SAVE_LABEL[saveState]}
        </span>
        <button
          onClick={() => void save()}
          disabled={saveState === "saved" || saveState === "saving"}
          title="บันทึก draft (Ctrl+S)"
          className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          <Save size={13} /> บันทึก
        </button>

        {isPublic && (
          <Link
            href={`/r/${resume.slug}`}
            target="_blank"
            className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            <ExternalLink size={13} /> ดูหน้าเว็บ
          </Link>
        )}
        {isPublic ? (
          <button
            onClick={handleUnpublish}
            disabled={publishing}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Unpublish
          </button>
        ) : null}
        <button
          onClick={handlePublish}
          disabled={publishing}
          title="บันทึก draft ปัจจุบันแล้วเผยแพร่เป็นเวอร์ชันสาธารณะ"
          className="flex items-center gap-1.5 rounded-md bg-navy px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-navy/90 disabled:opacity-50"
        >
          <Globe size={13} /> {publishing ? "กำลังเผยแพร่…" : "Publish"}
        </button>
      </div>

      {/* Canvas */}
      <div className="flex flex-1 flex-col items-center pb-20 md:py-10">
        {content ? (
          <ResumeView
            key={lang}
            content={content}
            contact={doc.contact}
            config={config}
            editable
            resumeId={resume.id}
            onUpdate={update}
            onConfigChange={(next) => setConfig((prev) => ({ ...prev, ...next }))}
          />
        ) : null}
      </div>
    </div>
  );
}
