import type { ReactNode } from "react";
import {
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { personal } from "../data/resume";

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
      <Icon size={12} className="shrink-0 text-navy" />
    </div>
  );
}

export default function Header({ compact = false }: { compact?: boolean }) {
  return (
    <header className="border-b-2 border-navy bg-white px-10 pb-5 pt-7">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={personal.photo}
            alt="Peerawet Chursuk"
            className="h-24 w-24 rounded-full bg-slate-200 object-cover ring-1 ring-slate-300"
          />
          <div>
            <h1 className="font-display text-[30px] font-bold leading-tight tracking-tight">
              {personal.name}
            </h1>
            <p className="mt-0.5 text-[15px] font-semibold text-slate-600">
              {personal.title}
            </p>
            {!compact && (
              <p className="mt-1 text-xs italic text-slate-500">
                {personal.motto}
              </p>
            )}
            <a
              href={personal.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-navy hover:underline"
            >
              <Globe size={12} /> {personal.website}
            </a>
          </div>
        </div>
        <div className="space-y-1 text-right text-xs">
          <ContactLine icon={MapPin} bold>
            {personal.location}
          </ContactLine>
          <ContactLine icon={Phone}>
            <a href={`tel:${personal.phone}`} className="hover:underline">
              {personal.phone}
            </a>
          </ContactLine>
          <ContactLine icon={Mail}>
            <a href={`mailto:${personal.email}`} className="hover:underline">
              {personal.email}
            </a>
          </ContactLine>
          {!compact && (
            <ContactLine icon={Github}>
              <a
                href={personal.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {personal.github}
              </a>
            </ContactLine>
          )}
          {!compact && (
            <ContactLine icon={Linkedin}>
              <a
                href={personal.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {personal.linkedin}
              </a>
            </ContactLine>
          )}
        </div>
      </div>
    </header>
  );
}
