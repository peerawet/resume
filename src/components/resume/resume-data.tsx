"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ResumeContent } from "@/i18n/types";
import type { Contact } from "@/i18n";

interface ResumeDataValue {
  content: ResumeContent;
  contact: Contact;
}

const ResumeDataContext = createContext<ResumeDataValue | null>(null);

export function ResumeDataProvider({
  value,
  children,
}: {
  value: ResumeDataValue;
  children: ReactNode;
}) {
  return (
    <ResumeDataContext.Provider value={value}>
      {children}
    </ResumeDataContext.Provider>
  );
}

export function useResumeData() {
  const ctx = useContext(ResumeDataContext);
  if (!ctx) {
    throw new Error("useResumeData must be used within a ResumeDataProvider");
  }
  return ctx;
}
