import { ExternalLink } from "lucide-react";
import SectionTitle from "./SectionTitle";
import { useLanguage } from "../context/language";

export function Profile() {
  const { t } = useLanguage();
  return (
    <section>
      <SectionTitle>{t.ui.sections.profile}</SectionTitle>
      <p className="text-[12.5px] leading-[1.65]">{t.profile}</p>
    </section>
  );
}

export function TechStack() {
  const { t } = useLanguage();
  return (
    <section>
      <SectionTitle>{t.ui.sections.techStack}</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {t.techStack.map((cat) => (
          <div key={cat.label}>
            <div className="tracked mb-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
              {cat.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cat.items.map((item) => (
                <span
                  key={item}
                  className="rounded border border-slate-300 bg-white px-2 text-[11.5px] leading-[22px] text-slate-700"
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
  const { t } = useLanguage();
  return (
    <section>
      <SectionTitle>{t.ui.sections.recognition}</SectionTitle>
      <ul className="flex flex-col gap-2 text-[12px] leading-relaxed">
        {t.recognition.map((item) => (
          <li
            key={item.highlight}
            className="relative pl-3.5 before:absolute before:left-0 before:top-[7px] before:h-1 before:w-1 before:rounded-full before:bg-navy"
          >
            <span className="font-semibold">{item.highlight}</span> {item.detail}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Experience() {
  const { t } = useLanguage();
  return (
    <section>
      <SectionTitle>{t.ui.sections.experience}</SectionTitle>
      <div className="ml-1 flex flex-col gap-4 border-l border-slate-200 pl-5">
        {t.experience.map((item) => (
          <div key={`${item.role}-${item.period}`} className="relative">
            <span className="absolute left-[-25px] top-[4px] h-[9px] w-[9px] rounded-full border-2 border-navy bg-white" />
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-[14.5px] font-bold">
                {item.role}
                {item.note && (
                  <span className="font-normal text-slate-500"> — {item.note}</span>
                )}
              </h3>
              <span className="whitespace-nowrap text-[12px] font-semibold text-navy">
                {item.period}
              </span>
            </div>
            <div className="mb-1.5 text-[12px] text-slate-500">{item.company}</div>
            <ul className="list-disc space-y-1 pl-4 text-[12.5px] leading-[1.55] marker:text-slate-400">
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
  const { t } = useLanguage();
  return (
    <section>
      <SectionTitle>{t.ui.sections.education}</SectionTitle>
      <div className="flex flex-col gap-3.5">
        {t.education.map((item) => (
          <div key={item.title}>
            <div className="text-[13px] font-bold leading-snug">{item.title}</div>
            {item.detail && (
              <div className="mt-0.5 text-[12px]">{item.detail}</div>
            )}
            {item.highlight && (
              <div className="text-[12px] font-semibold text-navy">
                {item.highlight}
              </div>
            )}
            {item.period && (
              <div className="mt-0.5 text-[12px] text-slate-500">
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
  const { t } = useLanguage();
  return (
    <section>
      <SectionTitle>{t.ui.sections.projects}</SectionTitle>
      <div className="flex flex-col gap-4">
        {t.projects.map((project) => (
          <div key={project.name}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14.5px] font-bold">{project.name}</h3>
              {project.status && (
                <span
                  className={`tracked rounded border px-1.5 text-[10px] font-semibold uppercase leading-4 tracking-[0.06em] ${
                    statusStyles[project.status] ?? ""
                  }`}
                >
                  {t.ui.status[project.status] ?? project.status}
                </span>
              )}
              {project.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-navy hover:underline"
                >
                  <ExternalLink size={11} /> {link.label}
                </a>
              ))}
            </div>
            <p className="mt-1.5 text-[12.5px] leading-[1.6]">
              {project.lead && (
                <span className="font-semibold">{project.lead} </span>
              )}
              {project.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
