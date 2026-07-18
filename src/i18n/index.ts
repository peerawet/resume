import enRaw from "./en.json";
import thRaw from "./th.json";
import type { Language, ResumeContent } from "./types";

export const content: Record<Language, ResumeContent> = {
  en: enRaw as ResumeContent,
  th: thRaw as ResumeContent,
};

/** Contact details are the same regardless of language. */
export const contact = {
  phone: "065-502-6360",
  email: "peerawet1996@gmail.com",
  github: "github.com/peerawet",
  githubUrl: "https://github.com/peerawet",
  linkedin: "linkedin.com/in/peerawet-chursuk",
  linkedinUrl: "https://www.linkedin.com/in/peerawet-chursuk/",
  photo: "/photo.jpg",
};

export type Contact = typeof contact;

export const languages: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "th", label: "ไทย" },
];

export type { Language, ResumeContent } from "./types";
