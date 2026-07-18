"use client";

import { EditableText } from "./editing";

export default function SectionTitle({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (value: string) => void;
}) {
  return (
    <h2 className="tracked relative mb-2.5 border-b border-slate-300 pb-1.5 text-[calc(14px+var(--fs-d,0px))] font-bold uppercase tracking-[0.16em] text-navy after:absolute after:-bottom-px after:left-0 after:h-[2px] after:w-8 after:bg-navy">
      <EditableText value={value} onCommit={onCommit} />
    </h2>
  );
}
