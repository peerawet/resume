import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Builder — สร้างเรซูเม่ออนไลน์ แชร์เป็นลิงก์",
  description:
    "สร้าง resume ที่แก้ไขบนตัวเอกสารได้โดยตรง เผยแพร่เป็นลิงก์สาธารณะ รองรับสองภาษาและพิมพ์เป็น PDF",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Noto+Serif+Thai:wght@600;700&family=Source+Serif+4:ital,wght@0,600;0,700;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
