/**
 * ตั้ง/เปลี่ยนรหัสผ่านให้ user ที่มีอยู่ (เช่น เจ้าของที่ถูก seed ไว้)
 *   npx tsx prisma/set-password.ts <email> <password>
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error("usage: npx tsx prisma/set-password.ts <email> <password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("password ต้องยาวอย่างน้อย 8 ตัวอักษร");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { passwordHash },
  });
  console.log(`password set for ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
