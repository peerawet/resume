import { useLayoutEffect, useRef, useState } from "react";
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

export default function ResumePage() {
  const { lang, t } = useLanguage();
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Fit the content to exactly one A4 sheet. If it is taller than the page we
  // scale it down; the min-height is divided back out by the same factor so,
  // once scaled, the block is exactly one page tall and the footer stays glued
  // to the bottom edge — the sheet always reads as full, in either language.
  // Transforms don't change layout height, so the measurement never loops.
  useLayoutEffect(() => {
    const page = pageRef.current;
    const content = contentRef.current;
    if (!page || !content) return;
    const available = page.clientHeight;
    const needed = content.scrollHeight;
    setScale(needed > available ? available / needed : 1);
  }, [lang]);

  return (
    <div
      ref={pageRef}
      className="h-[297mm] w-[210mm] overflow-hidden bg-white shadow-2xl print:shadow-none"
    >
      <div
        ref={contentRef}
        className="flex flex-col"
        style={{
          minHeight: `${PAGE_MM / scale}mm`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${100 / scale}%`,
        }}
      >
        <Header />

        <div className="flex min-h-0 flex-1">
          <aside className="flex w-[35%] shrink-0 flex-col gap-5 border-r border-slate-200 bg-slate-50 px-7 py-6">
            <TechStack />
            <Recognition />
            <Education />
          </aside>
          <main className="flex min-w-0 flex-1 flex-col gap-5 px-8 py-6">
            <Profile />
            <Experience />
            <Projects />
          </main>
        </div>

        <footer className="tracked mt-auto flex items-center justify-between border-t border-slate-200 px-9 py-2.5 text-[10px] uppercase tracking-[0.14em] text-slate-400">
          <span>
            {t.personal.name} · {t.ui.footerRole}
          </span>
          <span>{t.personal.location}</span>
        </footer>
      </div>
    </div>
  );
}
