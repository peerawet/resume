"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import Header from "./Header";
import {
  Education,
  Experience,
  Profile,
  Projects,
  Recognition,
  TechStack,
} from "./sections";
import { ResumeDataProvider } from "./resume-data";
import type { ResumeContent } from "@/i18n/types";
import type { Contact } from "@/i18n";

const PAGE_MM = 297;
const FONT_STEP = 0.5;
const LEFT_PCT_MIN = 18;
const LEFT_PCT_MAX = 45;

export interface ResumeViewConfig {
  fontDelta?: number;
  leftPct?: number;
}

interface ResumeViewProps {
  content: ResumeContent;
  contact: Contact;
  config?: ResumeViewConfig;
}

/**
 * Presentational resume — ตัวเดียวใช้ทั้งหน้า public / editor / preview
 * (Phase ถัดไปจะเพิ่ม `editable` + callback เซฟ config)
 *
 * Layout: < md เป็น single column (ไม่มี A4/auto-fit/column drag),
 * ≥ md และตอน print เป็นกระดาษ A4 เหมือนเดิม
 */
export default function ResumeView({ content, contact, config }: ResumeViewProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [fontDelta, setFontDelta] = useState(config?.fontDelta ?? 0);
  const [leftPct, setLeftPct] = useState(config?.leftPct ?? 28);
  const [dragging, setDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Fit the content to exactly one A4 sheet at the *base* font size. If it is
  // taller than the page we scale it down; the min-height is divided back out
  // by the same factor so, once scaled, the block is exactly one page tall and
  // the footer stays glued to the bottom edge — the sheet always reads as full.
  // The fit styles (and the font delta) are neutralised before measuring so we
  // read the natural height: this way the auto-fit does NOT react to the user's
  // font adjustment. Otherwise growing the font would shrink the scale to keep
  // it on one page, cancelling out the change (it even looked inverted). With
  // the fit fixed to the base font, the delta now grows/shrinks the resume for
  // real — it may overflow the page, which is the user's call.
  // (deps จงใจไม่มี fontDelta; บน mobile ปิด auto-fit — layout ไม่ใช่ A4)
  useLayoutEffect(() => {
    if (!isDesktop) {
      setScale(1);
      return;
    }
    const page = pageRef.current;
    const el = contentRef.current;
    if (!page || !el) return;
    const previous = el.style.cssText;
    el.style.minHeight = "0";
    el.style.transform = "none";
    el.style.width = "100%";
    el.style.setProperty("--fs-d", "0px");
    const available = page.clientHeight;
    const needed = el.scrollHeight;
    el.style.cssText = previous;
    setScale(needed > available ? available / needed : 1);
  }, [content, leftPct, isDesktop]);

  const startColumnDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    setDragging(true);
    const onMove = (move: PointerEvent) => {
      const columns = columnsRef.current;
      if (!columns) return;
      const rect = columns.getBoundingClientRect();
      const pct = ((move.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(LEFT_PCT_MAX, Math.max(LEFT_PCT_MIN, pct)));
    };
    const onUp = () => {
      setDragging(false);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  };

  const adjustFont = (steps: number) =>
    setFontDelta((current) => current + steps * FONT_STEP);

  const fitStyles: React.CSSProperties = isDesktop
    ? {
        minHeight: `${PAGE_MM / scale}mm`,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: `${100 / scale}%`,
      }
    : {};

  return (
    <ResumeDataProvider value={{ content, contact }}>
      <div
        ref={pageRef}
        className="w-full bg-white md:h-[297mm] md:w-[210mm] md:overflow-hidden md:shadow-2xl print:h-[297mm] print:w-[210mm] print:overflow-hidden print:shadow-none"
      >
        <div
          ref={contentRef}
          className="flex min-h-full flex-col"
          style={
            {
              "--fs-d": `${fontDelta}px`,
              ...fitStyles,
            } as React.CSSProperties
          }
        >
          <Header />

          <div
            ref={columnsRef}
            className="flex flex-col md:min-h-0 md:flex-1 md:flex-row print:min-h-0 print:flex-1 print:flex-row"
            style={{ "--left-w": `${leftPct}%` } as React.CSSProperties}
          >
            <aside className="flex flex-col gap-5 bg-slate-50 px-5 py-6 md:w-[var(--left-w)] md:shrink-0 md:px-6 print:w-[var(--left-w)] print:shrink-0 print:px-6">
              <TechStack />
              <Recognition />
              <Education />
            </aside>
            {/* Column divider. The 1px line is what prints; the wider grip and
               hover highlight are screen-only affordances that tell the user the
               boundary can be dragged. Hidden on mobile — single column. */}
            <div className="relative hidden w-px shrink-0 bg-slate-200 md:block print:block">
              <div
                onPointerDown={startColumnDrag}
                title="ลากเพื่อปรับความกว้างซ้าย–ขวา / Drag to resize columns"
                className="group absolute inset-y-0 left-[-8px] right-[-8px] z-20 flex cursor-col-resize items-center justify-center print:hidden"
              >
                {/* screen-only highlight over the print line */}
                <span
                  className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors ${
                    dragging ? "bg-navy" : "bg-transparent group-hover:bg-navy/40"
                  }`}
                />
                {/* the grip pill — always faintly visible, brightens on hover/drag */}
                <span
                  className={`relative flex h-9 w-[15px] items-center justify-center rounded-full border shadow-sm transition-colors ${
                    dragging
                      ? "border-navy bg-navy text-white"
                      : "border-slate-300 bg-white text-slate-400 group-hover:border-navy/60 group-hover:text-navy"
                  }`}
                >
                  <GripVertical size={13} strokeWidth={2.25} />
                </span>
              </div>
            </div>
            <main className="flex min-w-0 flex-1 flex-col gap-5 px-5 py-6 md:px-9 print:px-9">
              <Profile />
              <Experience />
              <Projects />
            </main>
          </div>

          <footer className="tracked mt-auto flex items-center justify-between gap-2 border-t border-slate-200 px-5 py-2.5 text-[calc(12px+var(--fs-d,0px))] uppercase tracking-[0.14em] text-slate-400 md:px-9 print:px-9">
            <span>
              {content.personal.name} · {content.ui.footerRole}
            </span>
            <span>{content.personal.location}</span>
          </footer>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-50 flex items-center overflow-hidden rounded-md border border-slate-300 bg-white shadow-md print:hidden">
        <button
          onClick={() => adjustFont(-1)}
          title="ลดขนาดฟ้อนต์ / Decrease font size"
          className="px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          A−
        </button>
        <button
          onClick={() => setFontDelta(0)}
          title="รีเซ็ตขนาดฟ้อนต์ / Reset font size"
          className="min-w-[64px] border-x border-slate-200 px-2 py-2 text-center text-xs font-semibold tabular-nums text-slate-500 hover:bg-slate-100"
        >
          {fontDelta > 0 ? `+${fontDelta}px` : `${fontDelta}px`}
        </button>
        <button
          onClick={() => adjustFont(1)}
          title="เพิ่มขนาดฟ้อนต์ / Increase font size"
          className="px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          A+
        </button>
      </div>
    </ResumeDataProvider>
  );
}
