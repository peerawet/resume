import { ExternalLink } from "lucide-react";
import SectionTitle from "./SectionTitle";
import {
  education,
  profile,
  projects,
  recognition,
  techStack,
  type ExperienceItem,
} from "../data/resume";

export function Profile() {
  return (
    <section>
      <SectionTitle>Profile</SectionTitle>
      <p className="text-[11px] leading-relaxed">{profile}</p>
    </section>
  );
}

export function TechStack() {
  return (
    <section>
      <SectionTitle>Tech Stack</SectionTitle>
      <div className="flex flex-col gap-3">
        {techStack.map((cat) => (
          <div key={cat.label}>
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {cat.label}
            </div>
            <div className="flex flex-wrap gap-1">
              {cat.items.map((item) => (
                <span
                  key={item}
                  className="rounded-[3px] border border-slate-300 bg-white px-2 text-[10px] leading-[18px] text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Recognition() {
  return (
    <section>
      <SectionTitle>Recognition</SectionTitle>
      <ul className="flex flex-col gap-2 text-[11px] leading-snug">
        {recognition.map((item) => (
          <li
            key={item.highlight}
            className="relative pl-3 before:absolute before:left-0 before:top-[6px] before:h-1 before:w-1 before:rounded-full before:bg-navy"
          >
            <span className="font-semibold">{item.highlight}</span>{" "}
            {item.detail}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Experience({
  title,
  items,
}: {
  title: string;
  items: ExperienceItem[];
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className="ml-1 flex flex-col gap-5 border-l border-slate-200 pl-5">
        {items.map((item) => (
          <div key={`${item.role}-${item.period}`} className="relative">
            <span className="absolute -left-[25px] top-[3px] h-[9px] w-[9px] rounded-full border-2 border-navy bg-white" />
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-[13px] font-bold">
                {item.role}
                {item.note && (
                  <span className="font-normal text-slate-500">
                    {" "}
                    — {item.note}
                  </span>
                )}
              </h3>
              <span className="whitespace-nowrap text-[11px] font-semibold text-navy">
                {item.period}
              </span>
            </div>
            <div className="mb-1.5 text-[11px] text-slate-500">
              {item.company}
            </div>
            <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed marker:text-slate-400">
              {item.bullets.map((bullet) => (
                <li key={bullet.text}>
                  {bullet.lead && (
                    <span className="font-semibold">{bullet.lead} </span>
                  )}
                  {bullet.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Education() {
  return (
    <section>
      <SectionTitle>Education &amp; Certificates</SectionTitle>
      <div className="flex flex-col gap-3">
        {education.map((item) => (
          <div key={item.title}>
            <div className="text-xs font-bold leading-snug">{item.title}</div>
            {item.detail && (
              <div className="mt-0.5 text-[11px]">{item.detail}</div>
            )}
            {item.highlight && (
              <div className="text-[11px] font-semibold text-navy">
                {item.highlight}
              </div>
            )}
            {item.period && (
              <div className="mt-0.5 text-[11px] text-slate-500">
                {item.period}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

const statusStyles: Record<string, string> = {
  Completed: "border-navy/30 bg-navy/5 text-navy",
  "In progress": "border-slate-300 bg-white text-slate-500",
};

export function Projects() {
  return (
    <section>
      <SectionTitle>Project Highlights</SectionTitle>
      <div className="flex flex-col gap-4">
        {projects.map((project) => (
          <div key={project.name}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[13px] font-bold">{project.name}</h3>
              {project.status && (
                <span
                  className={`rounded-[3px] border px-1.5 text-[9px] font-semibold uppercase leading-4 tracking-[0.06em] ${
                    statusStyles[project.status]
                  }`}
                >
                  {project.status}
                </span>
              )}
              {project.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-navy hover:underline"
                >
                  <ExternalLink size={10} /> {link.label}
                </a>
              ))}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed">
              {project.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
