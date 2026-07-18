export interface Personal {
  name: string;
  title: string;
  motto: string;
  location: string;
}

export interface TechCategory {
  label: string;
  items: string[];
}

export interface RecognitionItem {
  highlight: string;
  detail: string;
}

export interface Bullet {
  lead?: string;
  text: string;
}

export interface ExperienceItem {
  role: string;
  note?: string;
  company: string;
  period: string;
  bullets: Bullet[];
}

export interface EducationItem {
  title: string;
  detail?: string;
  highlight?: string;
  period?: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  name: string;
  status?: string;
  links: ProjectLink[];
  lead?: string;
  description: string;
}

export interface UiText {
  sections: {
    profile: string;
    techStack: string;
    recognition: string;
    experience: string;
    education: string;
    projects: string;
  };
  status: Record<string, string>;
  print: string;
  footerRole: string;
}

/** ข้อมูลติดต่อ — ใช้ร่วมกันทุกภาษา ทุก field เป็น optional สำหรับ resume ของ user ใหม่ */
export interface ContactInfo {
  phone?: string;
  email?: string;
  github?: string;
  githubUrl?: string;
  linkedin?: string;
  linkedinUrl?: string;
  photo?: string;
  /** ขนาดกรอบรูปบน resume (px) — default 92 */
  photoSize?: number;
  /** ซูมรูปภายในกรอบ (≥1) — default 1 */
  photoZoom?: number;
  /** เลื่อนตำแหน่งรูปในกรอบ เป็น % ของกรอบ — ใช้ได้เมื่อ zoom > 1 */
  photoX?: number;
  photoY?: number;
}

export interface ResumeContent {
  personal: Personal;
  profile: string;
  techStack: TechCategory[];
  recognition: RecognitionItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: Project[];
  ui: UiText;
}

export type Language = "en" | "th";
