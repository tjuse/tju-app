import { Header } from "@/components/dashboard/header";
import { FadeIn } from "@/components/motion/fade-in";
import { GradesView } from "@/features/grades/grades-view";

export const metadata = { title: "成绩" };

export default function GradesPage() {
  return (
    <>
      <Header title="成绩" subtitle="历史成绩查询" />
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 md:px-8">
        <FadeIn>
          <GradesView />
        </FadeIn>
      </div>
    </>
  );
}
