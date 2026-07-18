"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ContactInfo, ResumeContent } from "@/i18n/types";

interface ResumeDataValue {
  content: ResumeContent;
  contact: ContactInfo;
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
