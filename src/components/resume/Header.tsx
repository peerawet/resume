"use client";

import type { ReactNode } from "react";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { useResumeData } from "./resume-data";

function ContactLine({
  icon: Icon,
  bold = false,
  children,
}: {
  icon: LucideIcon;
  bold?: boolean;
  children: ReactNode;
}) {
  // มือถือ: ไอคอนอยู่ซ้าย ชิดซ้าย (row-reverse + justify-end) —
  // เดสก์ท็อป/print: ข้อความก่อนไอคอน ชิดขวา ตาม layout A4 เดิม
  return (
    <div
      className={`flex flex-row-reverse items-center justify-end gap-1.5 md:flex-row print:flex-row ${
        bold ? "font-semibold" : ""
      }`}
    >
      <span>{children}</span>
      <Icon size={15} className="shrink-0 text-navy" />
    </div>
  );
}

export default function Header() {
  const { content, contact } = useResumeData();
  const { personal } = content;

  return (
    <header className="flex flex-col gap-4 border-b-2 border-navy bg-white px-5 pb-5 pt-6 md:flex-row md:items-center md:justify-between md:gap-6 md:px-9 md:pt-7 print:flex-row print:items-center print:justify-between print:gap-6 print:px-9 print:pt-7">
      <div className="flex items-center gap-4 md:gap-5 print:gap-5">
        <img
          src={contact.photo}
          alt={personal.name}
          className="h-[92px] w-[92px] rounded-full bg-slate-200 object-cover ring-1 ring-slate-300"
        />
        <div>
          <h1 className="font-display text-[calc(28px+var(--fs-d,0px))] font-bold leading-tight tracking-tight md:text-[calc(36px+var(--fs-d,0px))] print:text-[calc(36px+var(--fs-d,0px))]">
            {personal.name}
          </h1>
          <p className="mt-1 text-[calc(17px+var(--fs-d,0px))] font-semibold text-slate-600">
            {personal.title}
          </p>
          <p className="mt-1.5 text-[calc(15px+var(--fs-d,0px))] italic text-slate-500">
            {personal.motto}
          </p>
        </div>
      </div>
      <div className="space-y-1 text-left text-[calc(14.5px+var(--fs-d,0px))] md:shrink-0 md:text-right print:shrink-0 print:text-right">
        <ContactLine icon={MapPin} bold>
          {personal.location}
        </ContactLine>
        <ContactLine icon={Phone}>
          <a href={`tel:${contact.phone}`} className="hover:underline">
            {contact.phone}
          </a>
        </ContactLine>
        <ContactLine icon={Mail}>
          <a href={`mailto:${contact.email}`} className="hover:underline">
            {contact.email}
          </a>
        </ContactLine>
        <ContactLine icon={Github}>
          <a
            href={contact.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            {contact.github}
          </a>
        </ContactLine>
        <ContactLine icon={Linkedin}>
          <a
            href={contact.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            {contact.linkedin}
          </a>
        </ContactLine>
      </div>
    </header>
  );
}
