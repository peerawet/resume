"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth";

export interface AuthFormState {
  error?: string;
  /** ให้ฟอร์มคงค่าอีเมลไว้หลัง error (React reset ฟอร์มหลัง action จบ) */
  email?: string;
}

const emailSchema = z.string().email("รูปแบบอีเมลไม่ถูกต้อง").max(200);
const passwordSchema = z
  .string()
  .min(8, "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร")
  .max(100);

export async function loginAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง", email };
    }
    throw error; // NEXT_REDIRECT (login สำเร็จ) ต้องปล่อยผ่าน
  }
}

const signupSchema = z.object({
  name: z.string().max(100),
  email: emailSchema,
  password: passwordSchema,
  confirm: z.string(),
});

export async function signupAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const { name, email: rawEmail, password, confirm } = parsed.data;
  if (password !== confirm) {
    return { error: "รหัสผ่านทั้งสองช่องไม่ตรงกัน" };
  }
  const email = rawEmail.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "อีเมลนี้ถูกใช้สมัครแล้ว — ลองเข้าสู่ระบบแทน" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, name: name || null, passwordHash },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "สมัครสำเร็จแต่เข้าสู่ระบบอัตโนมัติไม่ได้ — ลอง login เอง" };
    }
    throw error;
  }
}
