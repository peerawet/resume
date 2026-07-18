import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google verify email เสมอ — เปิด linking เพื่อให้ user ที่ถูก seed ไว้
    // (เจ้าของ) login ด้วย Google แล้วผูกกับ row เดิมได้
    Google({ allowDangerousEmailAccountLinking: true }),
    GitHub,
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
