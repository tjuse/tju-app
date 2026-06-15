import { Header } from "@/components/dashboard/header";
import { FadeIn } from "@/components/motion/fade-in";
import { GradesView } from "@/features/grades/grades-view";
import { isDemoMode } from "@/lib/runtime";
import { readCachedScore } from "@/lib/tju/score-store";

export const metadata = { title: "成绩" };
export const dynamic = "force-dynamic";

export default async function GradesPage() {
  const demo = isDemoMode();
  // Never attempt a live fetch during SSR — only read the local file cache.
  const cached = demo ? null : await readCachedScore();

  return (
    <>
      <Header title="成绩" subtitle="历史成绩查询" />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 md:px-8">
        <FadeIn>
          <GradesView initial={cached} demoMode={demo} />
        </FadeIn>
      </div>
    </>
  );
}
