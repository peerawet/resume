import type { ReactNode } from "react";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { contact } from "../i18n";
import { useLanguage } from "../context/language";

function ContactLine({
  icon: Icon,
  bold = false,
  children,
}: {
  icon: LucideIcon;
  bold?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex items-center justify-end gap-1.5 ${
        bold ? "font-semibold" : ""
      }`}
    >
      <span>{children}</span>
      <Icon size={15} className="shrink-0 text-navy" />
    </div>
  );
}

export default function Header() {
  const { t } = useLanguage();
  const { personal } = t;

  return (
    <header className="flex items-center justify-between gap-6 border-b-2 border-navy bg-white px-9 pb-5 pt-7">
      <div className="flex items-center gap-5">
        <img
          src={contact.photo}
          alt={personal.name}
          className="h-[92px] w-[92px] rounded-full bg-slate-200 object-cover ring-1 ring-slate-300"
        />
        <div>
          <h1 className="font-display text-[calc(36px+var(--fs-d,0px))] font-bold leading-tight tracking-tight">
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
      <div className="shrink-0 space-y-1 text-right text-[calc(14.5px+var(--fs-d,0px))]">
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
