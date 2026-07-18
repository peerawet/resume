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
import { useLanguage } from "../context/language";

const PAGE_MM = 297;
const FONT_STEP = 0.5;
const LEFT_PCT_MIN = 18;
const LEFT_PCT_MAX = 45;

export default function ResumePage() {
  const { lang, t } = useLanguage();
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [fontDelta, setFontDelta] = useState(0);
  const [leftPct, setLeftPct] = useState(28);
  const [dragging, setDragging] = useState(false);

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
  useLayoutEffect(() => {
    const page = pageRef.current;
    const content = contentRef.current;
    if (!page || !content) return;
    const previous = content.style.cssText;
    content.style.minHeight = "0";
    content.style.transform = "none";
    content.style.width = "100%";
    content.style.setProperty("--fs-d", "0px");
    const available = page.clientHeight;
    const needed = content.scrollHeight;
    content.style.cssText = previous;
    setScale(needed > available ? available / needed : 1);
  }, [lang, leftPct]);

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

  return (
    <>
      <div
        ref={pageRef}
        className="h-[297mm] w-[210mm] overflow-hidden bg-white shadow-2xl print:shadow-none"
      >
        <div
          ref={contentRef}
          className="flex flex-col"
          style={
            {
              "--fs-d": `${fontDelta}px`,
              minHeight: `${PAGE_MM / scale}mm`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: `${100 / scale}%`,
            } as React.CSSProperties
          }
        >
          <Header />

          <div ref={columnsRef} className="flex min-h-0 flex-1">
            <aside
              className="flex shrink-0 flex-col gap-5 bg-slate-50 px-6 py-6"
              style={{ width: `${leftPct}%` }}
            >
              <TechStack />
              <Recognition />
              <Education />
            </aside>
            {/* Column divider. The 1px line is what prints; the wider grip and
               hover highlight are screen-only affordances that tell the user the
               boundary can be dragged. */}
            <div className="relative w-px shrink-0 bg-slate-200">
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
            <main className="flex min-w-0 flex-1 flex-col gap-5 px-9 py-6">
              <Profile />
              <Experience />
              <Projects />
            </main>
          </div>

          <footer className="tracked mt-auto flex items-center justify-between border-t border-slate-200 px-9 py-2.5 text-[calc(12px+var(--fs-d,0px))] uppercase tracking-[0.14em] text-slate-400">
            <span>
              {t.personal.name} · {t.ui.footerRole}
            </span>
            <span>{t.personal.location}</span>
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
    </>
  );
}
