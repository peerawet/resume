"use client";

import { ExternalLink, Plus } from "lucide-react";
import SectionTitle from "./SectionTitle";
import { useResumeData } from "./resume-data";
import { EditableText, SortableList, UrlEditButton, useEditing } from "./editing";

export function Profile() {
  const { content: t } = useResumeData();
  const { editable, update } = useEditing();
  if (!editable && !t.profile) return null;
  return (
    <section>
      <SectionTitle
        value={t.ui.sections.profile}
        onCommit={(v) => update((d) => void (d.content.ui.sections.profile = v))}
      />
      <p className="text-[calc(14.5px+var(--fs-d,0px))] leading-[1.65]">
        <EditableText
          multiline
          value={t.profile}
          placeholder="เขียนแนะนำตัว 2–3 ประโยค…"
          onCommit={(v) => update((d) => void (d.content.profile = v))}
        />
      </p>
    </section>
  );
}

export function TechStack() {
  const { content: t } = useResumeData();
  const { editable, update } = useEditing();
  if (!editable && t.techStack.length === 0) return null;
  return (
    <section>
      <SectionTitle
        value={t.ui.sections.techStack}
        onCommit={(v) => update((d) => void (d.content.ui.sections.techStack = v))}
      />
      <SortableList
        items={t.techStack}
        onItemsChange={(cats) => update((d) => void (d.content.techStack = cats))}
        className="flex flex-col gap-2.5"
        onAdd={() =>
          update((d) => void d.content.techStack.push({ label: "Category", items: [] }))
        }
        addLabel="เพิ่มหมวด"
        renderItem={(cat, ci) => (
          <>
            <div className="tracked mb-1.5 text-[calc(13px+var(--fs-d,0px))] font-bold uppercase tracking-[0.06em] text-slate-500">
              <EditableText
                value={cat.label}
                onCommit={(v) => update((d) => void (d.content.techStack[ci].label = v))}
              />
            </div>
            <SortableList
              items={cat.items}
              onItemsChange={(items) =>
                update((d) => void (d.content.techStack[ci].items = items))
              }
              className="flex flex-wrap gap-1.5"
              itemAs="span"
              variant="chip"
              itemClassName={() =>
                "rounded border border-slate-300 bg-white px-2 text-[calc(13.5px+var(--fs-d,0px))] leading-[calc(26px+var(--fs-d,0px))] text-slate-700"
              }
              onAdd={() => update((d) => void d.content.techStack[ci].items.push("Skill"))}
              renderItem={(item, ii) => (
                <EditableText
                  value={item}
                  onCommit={(v) =>
                    update((d) => void (d.content.techStack[ci].items[ii] = v))
                  }
                />
              )}
            />
          </>
        )}
      />
    </section>
  );
}

export function Recognition() {
  const { content: t } = useResumeData();
  const { editable, update } = useEditing();
  if (!editable && t.recognition.length === 0) return null;
  return (
    <section>
      <SectionTitle
        value={t.ui.sections.recognition}
        onCommit={(v) => update((d) => void (d.content.ui.sections.recognition = v))}
      />
      <SortableList
        items={t.recognition}
        onItemsChange={(items) => update((d) => void (d.content.recognition = items))}
        as="ul"
        itemAs="li"
        className="flex flex-col gap-2 text-[calc(14px+var(--fs-d,0px))] leading-relaxed"
        itemClassName={() =>
          "relative pl-3.5 before:absolute before:left-0 before:top-[9px] before:h-1 before:w-1 before:rounded-full before:bg-navy"
        }
        onAdd={() =>
          update((d) =>
            void d.content.recognition.push({ highlight: "Achievement", detail: "" }),
          )
        }
        addLabel="เพิ่มรายการ"
        renderItem={(item, i) => (
          <>
            <span className="font-semibold">
              <EditableText
                value={item.highlight}
                onCommit={(v) => update((d) => void (d.content.recognition[i].highlight = v))}
              />
            </span>{" "}
            <EditableText
              multiline
              value={item.detail}
              placeholder="รายละเอียด…"
              onCommit={(v) => update((d) => void (d.content.recognition[i].detail = v))}
            />
          </>
        )}
      />
    </section>
  );
}

export function Experience() {
  const { content: t } = useResumeData();
  const { editable, update } = useEditing();
  if (!editable && t.experience.length === 0) return null;
  return (
    <section>
      <SectionTitle
        value={t.ui.sections.experience}
        onCommit={(v) => update((d) => void (d.content.ui.sections.experience = v))}
      />
      <SortableList
        items={t.experience}
        onItemsChange={(items) => update((d) => void (d.content.experience = items))}
        className="ml-1 flex flex-col gap-4 border-l border-slate-200 pl-5"
        itemClassName={() => "relative"}
        onAdd={() =>
          update((d) =>
            void d.content.experience.push({
              role: "Job Title",
              company: "Company",
              period: "2026 – Present",
              bullets: [{ text: "What did you achieve here?" }],
            }),
          )
        }
        addLabel="เพิ่มประสบการณ์"
        renderItem={(item, i) => (
          <>
            <span className="absolute left-[-25px] top-[6px] h-[9px] w-[9px] rounded-full border-2 border-navy bg-white" />
            <div className="flex flex-col gap-0.5 md:flex-row md:items-baseline md:justify-between md:gap-2 print:flex-row print:items-baseline print:gap-2">
              <h3 className="text-[calc(16.5px+var(--fs-d,0px))] font-bold">
                <EditableText
                  value={item.role}
                  onCommit={(v) => update((d) => void (d.content.experience[i].role = v))}
                />
                {(editable || item.note) && (
                  <span className="font-normal text-slate-500">
                    {" "}
                    ·{" "}
                    <EditableText
                      value={item.note ?? ""}
                      placeholder="หมายเหตุ"
                      onCommit={(v) =>
                        update((d) => void (d.content.experience[i].note = v || undefined))
                      }
                    />
                  </span>
                )}
              </h3>
              <span className="whitespace-nowrap text-[calc(14px+var(--fs-d,0px))] font-semibold text-navy">
                <EditableText
                  value={item.period}
                  onCommit={(v) => update((d) => void (d.content.experience[i].period = v))}
                />
              </span>
            </div>
            <div className="mb-1.5 text-[calc(14px+var(--fs-d,0px))] text-slate-500">
              <EditableText
                value={item.company}
                onCommit={(v) => update((d) => void (d.content.experience[i].company = v))}
              />
            </div>
            <SortableList
              items={item.bullets}
              onItemsChange={(bullets) =>
                update((d) => void (d.content.experience[i].bullets = bullets))
              }
              as="ul"
              itemAs="li"
              className="list-disc space-y-1 pl-4 text-[calc(14.5px+var(--fs-d,0px))] leading-[1.55] marker:text-slate-400"
              onAdd={() =>
                update((d) =>
                  void d.content.experience[i].bullets.push({ text: "New bullet" }),
                )
              }
              addLabel="เพิ่ม bullet"
              renderItem={(bullet, bi) => (
                <>
                  {(editable || bullet.lead) && (
                    <span className="font-semibold">
                      <EditableText
                        value={bullet.lead ?? ""}
                        placeholder="หัวข้อนำ"
                        onCommit={(v) =>
                          update(
                            (d) =>
                              void (d.content.experience[i].bullets[bi].lead =
                                v || undefined),
                          )
                        }
                      />{" "}
                    </span>
                  )}
                  <EditableText
                    multiline
                    value={bullet.text}
                    placeholder="รายละเอียดผลงาน…"
                    onCommit={(v) =>
                      update((d) => void (d.content.experience[i].bullets[bi].text = v))
                    }
                  />
                </>
              )}
            />
          </>
        )}
      />
    </section>
  );
}

export function Education() {
  const { content: t } = useResumeData();
  const { editable, update } = useEditing();
  if (!editable && t.education.length === 0) return null;
  return (
    <section>
      <SectionTitle
        value={t.ui.sections.education}
        onCommit={(v) => update((d) => void (d.content.ui.sections.education = v))}
      />
      <SortableList
        items={t.education}
        onItemsChange={(items) => update((d) => void (d.content.education = items))}
        className="flex flex-col gap-3.5"
        onAdd={() =>
          update((d) =>
            void d.content.education.push({ title: "Degree, University" }),
          )
        }
        addLabel="เพิ่มการศึกษา"
        renderItem={(item, i) => (
          <>
            <div className="text-[calc(15px+var(--fs-d,0px))] font-bold leading-snug">
              <EditableText
                value={item.title}
                onCommit={(v) => update((d) => void (d.content.education[i].title = v))}
              />
            </div>
            {(editable || item.detail) && (
              <div className="mt-0.5 text-[calc(14px+var(--fs-d,0px))]">
                <EditableText
                  value={item.detail ?? ""}
                  placeholder="สาขา/รายละเอียด"
                  onCommit={(v) =>
                    update((d) => void (d.content.education[i].detail = v || undefined))
                  }
                />
              </div>
            )}
            {(editable || item.highlight) && (
              <div className="text-[calc(14px+var(--fs-d,0px))] font-semibold text-navy">
                <EditableText
                  value={item.highlight ?? ""}
                  placeholder="เกียรตินิยม/ไฮไลต์"
                  onCommit={(v) =>
                    update((d) => void (d.content.education[i].highlight = v || undefined))
                  }
                />
              </div>
            )}
            {(editable || item.period) && (
              <div className="mt-0.5 text-[calc(14px+var(--fs-d,0px))] text-slate-500">
                <EditableText
                  value={item.period ?? ""}
                  placeholder="ช่วงปี"
                  onCommit={(v) =>
                    update((d) => void (d.content.education[i].period = v || undefined))
                  }
                />
              </div>
            )}
          </>
        )}
      />
    </section>
  );
}

const statusStyles: Record<string, string> = {
  Completed: "border-navy/30 bg-navy/5 text-navy",
  "In progress": "border-slate-300 bg-white text-slate-500",
};

const statusChipClass = (status: string | undefined) =>
  `tracked rounded border px-1.5 text-[calc(12px+var(--fs-d,0px))] font-semibold uppercase leading-[calc(16px+var(--fs-d,0px))] tracking-[0.06em] ${
    statusStyles[status ?? ""] ?? "border-slate-300 bg-white text-slate-500"
  }`;

export function Projects() {
  const { content: t } = useResumeData();
  const { editable, update } = useEditing();
  if (!editable && t.projects.length === 0) return null;
  return (
    <section>
      <SectionTitle
        value={t.ui.sections.projects}
        onCommit={(v) => update((d) => void (d.content.ui.sections.projects = v))}
      />
      <SortableList
        items={t.projects}
        onItemsChange={(items) => update((d) => void (d.content.projects = items))}
        className="flex flex-col gap-4"
        onAdd={() =>
          update((d) =>
            void d.content.projects.push({
              name: "Project Name",
              links: [],
              description: "What does this project do?",
            }),
          )
        }
        addLabel="เพิ่มโปรเจกต์"
        renderItem={(project, i) => (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[calc(16.5px+var(--fs-d,0px))] font-bold">
                <EditableText
                  value={project.name}
                  onCommit={(v) => update((d) => void (d.content.projects[i].name = v))}
                />
              </h3>
              {editable ? (
                <select
                  value={project.status ?? ""}
                  onChange={(e) =>
                    update(
                      (d) =>
                        void (d.content.projects[i].status = e.target.value || undefined),
                    )
                  }
                  className={`${statusChipClass(project.status)} cursor-pointer print:hidden`}
                >
                  <option value="">ไม่มีสถานะ</option>
                  <option value="Completed">
                    {t.ui.status["Completed"] ?? "Completed"}
                  </option>
                  <option value="In progress">
                    {t.ui.status["In progress"] ?? "In progress"}
                  </option>
                </select>
              ) : (
                project.status && (
                  <span className={statusChipClass(project.status)}>
                    {t.ui.status[project.status] ?? project.status}
                  </span>
                )
              )}
              {project.links.map((link, li) =>
                editable ? (
                  <span
                    key={li}
                    className="inline-flex items-center gap-0.5 text-[calc(13px+var(--fs-d,0px))] font-semibold text-navy"
                  >
                    <ExternalLink size={13} />
                    <EditableText
                      value={link.label}
                      onCommit={(v) =>
                        update((d) => void (d.content.projects[i].links[li].label = v))
                      }
                    />
                    <UrlEditButton
                      url={link.url}
                      onCommit={(v) =>
                        update((d) => void (d.content.projects[i].links[li].url = v))
                      }
                    />
                    <button
                      type="button"
                      title="ลบลิงก์"
                      onClick={() =>
                        update((d) => void d.content.projects[i].links.splice(li, 1))
                      }
                      className="text-slate-400 hover:text-red-600 print:hidden"
                    >
                      ×
                    </button>
                  </span>
                ) : (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-[calc(13px+var(--fs-d,0px))] font-semibold text-navy hover:underline"
                  >
                    <ExternalLink size={13} /> {link.label}
                  </a>
                ),
              )}
              {editable && (
                <button
                  type="button"
                  onClick={() =>
                    update(
                      (d) =>
                        void d.content.projects[i].links.push({
                          label: "Link",
                          url: "https://",
                        }),
                    )
                  }
                  className="inline-flex items-center gap-0.5 rounded border border-dashed border-slate-300 px-1.5 text-[11px] font-semibold text-slate-400 hover:border-navy/50 hover:text-navy print:hidden"
                >
                  <Plus size={10} /> ลิงก์
                </button>
              )}
            </div>
            <p className="mt-1.5 text-[calc(14.5px+var(--fs-d,0px))] leading-[1.6]">
              {(editable || project.lead) && (
                <span className="font-semibold">
                  <EditableText
                    value={project.lead ?? ""}
                    placeholder="หัวข้อนำ"
                    onCommit={(v) =>
                      update((d) => void (d.content.projects[i].lead = v || undefined))
                    }
                  />{" "}
                </span>
              )}
              <EditableText
                multiline
                value={project.description}
                placeholder="อธิบายโปรเจกต์…"
                onCommit={(v) =>
                  update((d) => void (d.content.projects[i].description = v))
                }
              />
            </p>
          </>
        )}
      />
    </section>
  );
}
