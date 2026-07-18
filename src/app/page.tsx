import Link from "next/link";
import {
  FileText,
  Languages,
  Link2,
  MousePointerClick,
  Printer,
  Smartphone,
} from "lucide-react";
import { prisma } from "@/lib/db";

export const revalidate = 3600;

const OWNER_EMAIL = "peerawet1996@gmail.com";

/** slug ตัวอย่าง = resume public ของเจ้าของ — ถ้า DB ล่ม/ยังไม่มี แค่ซ่อนปุ่ม ไม่ให้หน้าพัง */
async function getExampleSlug() {
  try {
    const resume = await prisma.resume.findFirst({
      where: { isPublic: true, user: { email: OWNER_EMAIL } },
      select: { slug: true },
    });
    return resume?.slug ?? null;
  } catch {
    return null;
  }
}

const FEATURES = [
  {
    icon: MousePointerClick,
    title: "แก้บนตัว resume โดยตรง",
    detail:
      "คลิกที่ข้อความแล้วพิมพ์ได้เลย เห็นผลลัพธ์จริงทันที ไม่ต้องกรอกฟอร์มแยกแล้วนั่งเดาว่าออกมาหน้าตาเป็นยังไง",
  },
  {
    icon: Link2,
    title: "แชร์เป็นลิงก์เดียว",
    detail:
      "กด Publish แล้วส่งลิงก์ให้ HR ได้ทันที แก้เนื้อหาเมื่อไหร่ลิงก์เดิมอัปเดตให้เอง ไม่ต้องแนบไฟล์ใหม่",
  },
  {
    icon: Languages,
    title: "สองภาษาในฉบับเดียว",
    detail:
      "ทำเวอร์ชันไทยและอังกฤษคู่กัน ผู้เข้าชมสลับภาษาได้จากหน้าเดียวกัน",
  },
  {
    icon: Printer,
    title: "พิมพ์เป็น PDF ได้เสมอ",
    detail:
      "เค้าโครง A4 ที่จัดให้พอดีหน้าโดยอัตโนมัติ สั่งพิมพ์หรือเซฟเป็น PDF ได้จากทุกอุปกรณ์",
  },
  {
    icon: Smartphone,
    title: "ใช้ได้ทั้งมือถือและเดสก์ท็อป",
    detail: "อ่านสบายบนจอเล็ก และแก้ไขจากมือถือได้เหมือนกัน",
  },
  {
    icon: FileText,
    title: "ปรับแต่งได้ละเอียด",
    detail:
      "ขยับขนาดฟ้อนต์ทีละครึ่ง pixel ลากปรับสัดส่วนคอลัมน์ จัดลำดับเนื้อหาด้วยการลากวาง",
  },
];

export default async function Home() {
  const exampleSlug = await getExampleSlug();

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* Nav */}
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="font-display text-lg font-bold text-navy">
          Resume Builder
        </span>
        <Link
          href="/login"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          เข้าสู่ระบบ
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-16 pt-14 text-center md:pt-24">
        <h1 className="font-display max-w-3xl text-4xl font-bold leading-tight text-navy md:text-5xl">
          สร้าง resume ที่สวยตั้งแต่ต้น
          <br className="hidden md:block" /> แก้ได้ทันที แชร์เป็นลิงก์เดียว
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
          คลิกแก้ข้อความบนตัว resume ได้โดยตรง เห็นหน้าตาจริงตลอดเวลา
          กดเผยแพร่แล้วได้ลิงก์สาธารณะส่งให้ใครก็ได้ — อัปเดตเนื้อหาโดยไม่ต้องส่งไฟล์ใหม่อีกเลย
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-navy px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-navy/90"
          >
            เริ่มสร้างฟรี
          </Link>
          {exampleSlug && (
            <Link
              href={`/r/${exampleSlug}`}
              className="rounded-md border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
            >
              ดูตัวอย่าง resume
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-navy/10 text-navy">
                <feature.icon size={18} />
              </div>
              <h2 className="mt-3 text-base font-bold">{feature.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {feature.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA + footer */}
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-navy">
          พร้อมใช้แล้ววันนี้ ฟรี
        </h2>
        <p className="mt-2 text-slate-600">
          สมัครด้วยอีเมลแล้วเริ่มจากเทมเพลตได้เลย
        </p>
        <Link
          href="/signup"
          className="mt-6 rounded-md bg-navy px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-navy/90"
        >
          สร้าง resume ของคุณ
        </Link>
      </section>
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        Resume Builder
      </footer>
    </div>
  );
}
