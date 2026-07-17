import type { ReactNode } from "react";

interface A4PageProps {
  page: number;
  total: number;
  children: ReactNode;
}

export default function A4Page({ page, total, children }: A4PageProps) {
  return (
    <div className="flex h-[297mm] w-[210mm] break-after-page flex-col overflow-hidden bg-white shadow-2xl print:shadow-none">
      {children}
      <footer className="mt-auto flex items-center justify-between border-t border-slate-200 px-10 py-2.5 text-[9px] uppercase tracking-[0.14em] text-slate-400">
        <span>Peerawet Chursuk · Software Engineer</span>
        <span>
          Page {page} of {total}
        </span>
      </footer>
    </div>
  );
}
