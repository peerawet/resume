import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  createResumeAndGo,
  publishResume,
  unpublishResume,
} from "@/actions/resume";
import { DeleteResumeButton } from "./resume-actions";

function SignInScreen() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy">
          Resume Builder
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          เข้าสู่ระบบเพื่อสร้างและแก้ไข resume ของคุณ
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              เข้าสู่ระบบด้วย Google
            </button>
          </form>
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              เข้าสู่ระบบด้วย GitHub
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return <SignInScreen />;

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      isPublic: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">
            Resume ของฉัน
          </h1>
          <p className="mt-1 text-sm text-slate-500">{session.user.email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/dashboard" });
          }}
        >
          <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            ออกจากระบบ
          </button>
        </form>
      </div>

      <form action={createResumeAndGo} className="mt-6">
        <button className="rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy/90">
          + สร้าง resume ใหม่
        </button>
      </form>

      <ul className="mt-6 flex flex-col gap-3">
        {resumes.length === 0 && (
          <li className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            ยังไม่มี resume — กดปุ่มด้านบนเพื่อสร้างฉบับแรก
          </li>
        )}
        {resumes.map((resume) => (
          <li
            key={resume.id}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{resume.title}</span>
                {resume.isPublic ? (
                  <span className="rounded border border-green-300 bg-green-50 px-1.5 py-0.5 text-xs font-semibold text-green-700">
                    เผยแพร่แล้ว
                  </span>
                ) : (
                  <span className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-xs font-semibold text-slate-500">
                    ฉบับร่าง
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                แก้ไขล่าสุด{" "}
                {resume.updatedAt.toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/editor/${resume.id}`}
                className="rounded-md bg-navy px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy/90"
              >
                แก้ไข
              </Link>
              {resume.isPublic && (
                <Link
                  href={`/r/${resume.slug}`}
                  target="_blank"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  เปิดลิงก์สาธารณะ
                </Link>
              )}
              {resume.isPublic ? (
                <form action={unpublishResume.bind(null, resume.id)}>
                  <button className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                    Unpublish
                  </button>
                </form>
              ) : (
                <form action={publishResume.bind(null, resume.id)}>
                  <button className="rounded-md bg-navy px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy/90">
                    Publish
                  </button>
                </form>
              )}
              <DeleteResumeButton id={resume.id} title={resume.title} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
