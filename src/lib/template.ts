import type { ResumeContent } from "@/i18n/types";
import type { ResumeDocument } from "./schema";

/**
 * เนื้อหาตั้งต้นสำหรับ resume ที่สร้างใหม่ — placeholder กลางๆ ให้ user
 * แก้ inline ได้ทันที (Phase 3) เริ่มจากภาษาเดียว (en) เพิ่ม th ทีหลังได้
 */
const starterContent: ResumeContent = {
  personal: {
    name: "Your Name",
    title: "Your Job Title",
    motto: "A short line about how you work",
    location: "City, Country",
  },
  profile:
    "Write 2–3 sentences that summarise who you are, what you build, and the impact you deliver.",
  techStack: [
    { label: "Languages", items: ["TypeScript", "Python"] },
    { label: "Frameworks", items: ["React", "Next.js"] },
    { label: "Tools", items: ["Git", "Docker"] },
  ],
  recognition: [
    {
      highlight: "Award or achievement",
      detail: "— one line describing why it matters.",
    },
  ],
  experience: [
    {
      role: "Job Title",
      company: "Company Name",
      period: "2023 – Present",
      bullets: [
        { lead: "Did something impactful:", text: "describe the outcome with numbers if you can." },
        { text: "Another responsibility or achievement worth mentioning." },
      ],
    },
  ],
  education: [
    {
      title: "Degree, University",
      detail: "Field of study",
      period: "2015 – 2019",
    },
  ],
  projects: [
    {
      name: "Project Name",
      status: "Completed",
      links: [],
      description: "What the project does and what you built it with.",
    },
  ],
  ui: {
    sections: {
      profile: "Profile",
      techStack: "Tech Stack",
      recognition: "Recognition",
      experience: "Experience",
      education: "Education",
      projects: "Projects",
    },
    status: { Completed: "Completed", "In progress": "In progress" },
    print: "Print / PDF",
    footerRole: "Resume",
  },
};

export function createStarterDocument(): ResumeDocument {
  return structuredClone({
    en: starterContent,
    contact: {},
  });
}
