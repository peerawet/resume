import A4Page from "./A4Page";
import Header from "./Header";
import { Education, Experience, Projects } from "./sections";
import { experiencePage2 } from "../data/resume";

export default function PageTwo() {
  return (
    <A4Page page={2} total={2}>
      <Header compact />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[34%] shrink-0 flex-col gap-6 border-r border-slate-200 bg-slate-50 px-7 py-6">
          <Education />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col gap-6 px-8 py-6">
          <Experience
            title="Professional Experience (cont.)"
            items={experiencePage2}
          />
          <Projects />
        </main>
      </div>
    </A4Page>
  );
}
