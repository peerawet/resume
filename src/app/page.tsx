"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import ResumeView from "@/components/resume/ResumeView";
import { LanguageProvider, useLanguage } from "@/context/language";
import { contact, languages } from "@/i18n";

function Toolbar() {
  const { lang, setLang, t } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Peerawet_Chursuk_Resume",
  });

  return (
    <>
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 print:hidden">
        <div className="flex overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
          {languages.map((option) => (
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
        <button
          onClick={() => handlePrint()}
          className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-navy/90"
        >
          <Printer size={16} /> {t.ui.print}
        </button>
      </div>

      <div ref={contentRef} className="w-full md:w-auto">
        <ResumeView content={t} contact={contact} />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col items-center bg-slate-200 pb-20 pt-16 md:py-10 print:bg-white print:py-0">
        <Toolbar />
      </div>
    </LanguageProvider>
  );
}
