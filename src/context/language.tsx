import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { content } from "../i18n";
import type { Language, ResumeContent } from "../i18n/types";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: ResumeContent;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function initialLang(): Language {
  if (typeof window !== "undefined" && window.location.hash === "#th") {
    return "th";
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(initialLang);

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
