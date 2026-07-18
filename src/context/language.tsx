"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { content } from "@/i18n";
import type { Language, ResumeContent } from "@/i18n/types";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: ResumeContent;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // เริ่ม "en" เสมอ (ตรงกับ SSR) แล้วค่อยอ่าน #th หลัง mount — กัน hydration mismatch
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    if (window.location.hash === "#th") setLang("th");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: content[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
