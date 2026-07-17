export const personal = {
  name: "Peerawet Chursuk",
  title: "Software Engineer · Solution-Driven Full Stack Developer",
  motto: '"Think deep. Build fast. Stay curious."',
  photo:
    "https://lxyqtapnnytsigmrikoq.supabase.co/storage/v1/object/public/utill//fame-nobg.png",
  website: "resume.forifi.xyz",
  websiteUrl: "https://resume.forifi.xyz",
  location: "Nonthaburi, Thailand",
  phone: "065-502-6360",
  email: "peerawet1996@gmail.com",
  github: "github.com/peerawet",
  githubUrl: "https://github.com/peerawet",
  linkedin: "linkedin.com/in/peerawet-chursuk",
  linkedinUrl: "https://www.linkedin.com/in/peerawet-chursuk/",
};

export const profile =
  "Full stack developer with an industrial-engineering background, now building government-sector enterprise systems in React & TypeScript. My strongest work happens upstream of the code: turning vague or conflicting requirements into a system design that fits the constraints of the codebase that already exists — then shipping it fast with an AI-assisted workflow. Comfortable moving between developer, system analyst and UX roles within the same sprint.";

export interface TechCategory {
  label: string;
  items: string[];
}

export const techStack: TechCategory[] = [
  {
    label: "Languages",
    items: ["TypeScript", "JavaScript", "PHP", "SQL"],
  },
  {
    label: "Frameworks",
    items: ["React", "Next.js", "Express", "Laravel", "CodeIgniter", "Module Fed."],
  },
  {
    label: "Frontend Ecosystem",
    items: ["React Query", "React H. Form", "Redux", "Tailwind", "Vite", "Zod"],
  },
  {
    label: "Databases",
    items: ["PostgreSQL", "MySQL", "MSSQL", "MongoDB"],
  },
  {
    label: "Infra & DevOps",
    items: ["Docker", "CI/CD", "AWS", "Nutanix", "VMware", "Ubuntu"],
  },
  {
    label: "AI-Assisted Workflow",
    items: ["Claude", "Cursor", "Ollama", "Prompting"],
  },
];

export interface RecognitionItem {
  highlight: string;
  detail: string;
}

export const recognition: RecognitionItem[] = [
  {
    highlight: "Sprint MVP",
    detail: "— Top story-point performer (28 SP / 11 cards), Chanwanich, 2026",
  },
  {
    highlight: "Probation review: 89/100",
    detail: '— "Excellent" band; full marks on work quality & accuracy',
  },
  {
    highlight: "Voted 3rd for Deputy Team Lead",
    detail: "as the newest member of the team",
  },
  {
    highlight: "AWS Certified Developer",
    detail: "– Associate",
  },
];

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

export const experiencePage1: ExperienceItem[] = [
  {
    role: "Software Engineer",
    note: "Full-time (converted from contract)",
    company: "Chanwanich Co., Ltd. · Sathon, Bangkok · Hybrid",
    period: "Apr 2026 – Present",
    bullets: [
      {
        lead: "Unblocked a Phase-3 requirement without refactoring Phase 1–2.",
        text: "The client needed per-user permissions on a role-based system; the obvious path meant rewriting every permission API. Redesigned the permission screen from a flat row list into an expandable multi-level tree, so a per-user grant became a child permission the system already supported — weeks of refactoring avoided at near-zero backend cost.",
      },
      {
        lead: "Root-caused a production-only white screen",
        text: "in a Module Federation build: the esbuild minifier emitted a duplicate identifier, breaking the whole remote before a single line ran. Reproduced it in a headless browser against the real Docker serve setup, isolated the collision, and fixed it by switching the minifier to terser — no bundle-size or build-time regression.",
      },
      {
        text: "Work across developer, system-analyst and UX roles in the same sprint: reverse-engineer business logic from thin specs, agree the JSON contract with the backend team, then design and build the UI.",
      },
      {
        text: "Stack: React, TypeScript, Vite, Module Federation, React Query, React Hook Form.",
      },
    ],
  },
  {
    role: "Frontend Web Developer",
    company: "Chanwanich Co., Ltd. · Contract",
    period: "Oct 2025 – Mar 2026",
    bullets: [
      {
        text: "Delivered a critical project on time, saving the client from a significant financial penalty.",
      },
      {
        text: "Integrated and coordinated an outsourced team's codebase into the main project.",
      },
      {
        text: "Accelerated delivery by pairing AI tooling with fast business-context reading to identify what the client actually needed.",
      },
    ],
  },
];

export const experiencePage2: ExperienceItem[] = [
  {
    role: "Developer",
    company: "Phillip Asset Management Co., Ltd.",
    period: "Mar 2025 – Sep 2025",
    bullets: [
      {
        text: "Infrastructure & project setup on Nutanix with Docker Compose containerisation.",
      },
      {
        text: "Built internal systems with React + TypeScript, Express and CodeIgniter; maintained the legacy stack alongside.",
      },
      {
        text: "Integrated a local Ollama (Mistral) assistant so staff could ask questions against CRM data.",
      },
    ],
  },
  {
    role: "Junior Web Programmer",
    company: "Orange Technology Solution Co., Ltd.",
    period: "Apr 2024 – Jul 2024",
    bullets: [
      { text: "Gathered requirements directly from the customer." },
      { text: "Developed a flight-forwarding program." },
      { text: "Built a LINE chatbot integration." },
    ],
  },
];

export interface EducationItem {
  title: string;
  detail?: string;
  highlight?: string;
  period?: string;
}

export const education: EducationItem[] = [
  {
    title: "King Mongkut's University of Technology North Bangkok",
    detail: "B.Eng., Industrial Engineering",
    highlight: "Second Class Honours · 3.36 GPA",
    period: "2014 – 2018",
  },
  {
    title: "TechUp — Full-Time Full-Stack Bootcamp",
    detail: "Group leader and mentor for classmates",
    period: "2023 (4 months)",
  },
  {
    title: "AWS Certified Developer – Associate",
  },
];

export const workingWithAI = {
  text: "AI helps me go faster, but the system design still comes from me. I read the backend and the spec, decide the trade-offs, then let the tooling handle the typing.",
  quote:
    '"AI reflects what I know, not what I\'ve missed. Growth begins when I\'m ready to see what I couldn\'t before."',
};

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  name: string;
  status?: "Completed" | "In progress";
  links: ProjectLink[];
  description: string;
}

export const projects: Project[] = [
  {
    name: "Dormy",
    status: "Completed",
    links: [
      { label: "site", url: "https://dormy.forifi.xyz/" },
      { label: "code", url: "https://github.com/peerawet/dormy" },
    ],
    description:
      "Full-stack SaaS for dormitory management — billing, contracts, financial analytics and PDF generation. Next.js, TypeScript, PostgreSQL, Prisma, Redux, NextAuth, Tailwind, Recharts. Deployed on AWS ECS with RDS behind a load balancer.",
  },
  {
    name: "EasyWeb",
    status: "In progress",
    links: [{ label: "site", url: "https://www.forifi.xyz/" }],
    description:
      "A lean SaaS that lets non-technical users create and deploy static sites straight to GitHub Pages — built on the GitHub API alone, no database. Deployed on AWS ECS/EC2 with ALB and ACM for HTTPS.",
  },
  {
    name: "Document Management System",
    links: [
      { label: "site", url: "https://dms-frontend-q93o.onrender.com" },
      { label: "code", url: "https://github.com/peerawet/TPS" },
    ],
    description:
      "Document management built on Supabase as a full BaaS layer — JWT authentication, file management and cloud database operations.",
  },
];
