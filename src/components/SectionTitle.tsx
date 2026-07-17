import type { ReactNode } from "react";

export default function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="tracked relative mb-2.5 border-b border-slate-300 pb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-navy after:absolute after:-bottom-px after:left-0 after:h-[2px] after:w-7 after:bg-navy">
      {children}
    </h2>
  );
}
