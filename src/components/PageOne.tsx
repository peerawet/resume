import A4Page from "./A4Page";
import Header from "./Header";
import { Experience, Profile, Recognition, TechStack } from "./sections";
import { experiencePage1 } from "../data/resume";

export default function PageOne() {
  return (
    <A4Page page={1} total={2}>
      <Header />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[34%] shrink-0 flex-col gap-6 border-r border-slate-200 bg-slate-50 px-7 py-6">
          <TechStack />
          <Recognition />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col gap-6 px-8 py-6">
          <Profile />
          <Experience title="Professional Experience" items={experiencePage1} />
        </main>
      </div>
    </A4Page>
  );
}
