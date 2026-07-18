"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="font-display text-lg font-bold text-navy">
          Resume Builder
        </Link>
        <h1 className="mt-4 text-xl font-bold">เข้าสู่ระบบ</h1>
        <form action={action} className="mt-5 flex flex-col gap-3">
          <label className="text-sm font-semibold text-slate-600">
            อีเมล
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={state?.email}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal focus:border-navy focus:outline-none"
            />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            รหัสผ่าน
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal focus:border-navy focus:outline-none"
            />
          </label>
          {state?.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </p>
          )}
          <button
            disabled={pending}
            className="mt-1 rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy/90 disabled:opacity-50"
          >
            {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-500">
          ยังไม่มีบัญชี?{" "}
          <Link href="/signup" className="font-semibold text-navy hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </main>
  );
}
