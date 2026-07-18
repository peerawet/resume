import Link from "next/link";
import { FileText } from "lucide-react";
import { auth, signOut } from "@/lib/auth";

/**
 * Navbar ใช้ร่วมกันทุกหน้า (อยู่ใน root layout) — แบรนด์คลิกกลับหน้า landing,
 * ปุ่มขวาเปลี่ยนตามสถานะ login; ซ่อนตอนพิมพ์เสมอ
 *
 * หมายเหตุ: auth() อ่าน cookie ทำให้ทุกหน้า render แบบ dynamic —
 * แลก ISR ของ landing กับ navbar ที่แสดงสถานะ login ถูกต้องทุกหน้า (ตัดสินใจ 2026-07-18)
 */
export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-slate-200 bg-white px-4 py-2.5 md:px-6 print:hidden">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
        <Link
          href="/"
          title="กลับหน้าแรก"
          className="flex shrink-0 items-center gap-2 font-display text-[17px] font-bold tracking-tight text-navy hover:opacity-80"
        >
          <FileText size={19} strokeWidth={2.25} />
          Resume Builder
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                  ออกจากระบบ
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-navy px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-navy/90"
              >
                สมัครใช้งาน
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
