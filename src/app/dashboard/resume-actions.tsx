"use client";

import { useTransition } from "react";
import { deleteResume } from "@/actions/resume";

export function DeleteResumeButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (window.confirm(`ลบ "${title}" ถาวร? การลบย้อนกลับไม่ได้`)) {
          startTransition(() => deleteResume(id));
        }
      }}
      className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "กำลังลบ…" : "ลบ"}
    </button>
  );
}
