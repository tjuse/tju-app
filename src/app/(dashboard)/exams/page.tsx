import { Header } from "@/components/dashboard/header";
import { FadeIn } from "@/components/motion/fade-in";
import { currentSemesterCode, listSemesters } from "@/features/courses/semesters";
import { ExamsView } from "@/features/exams/exams-view";
import { isDemoMode } from "@/lib/runtime";
import { readCachedExam } from "@/lib/tju/exam-store";

export const metadata = { title: "考试" };
export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const demo = isDemoMode();
  const semester = currentSemesterCode();
  const semesters = listSemesters();
  // Only read cache during SSR — never spawn in demo mode.
  const cached = demo ? null : await readCachedExam(semester);

  return (
    <>
      <Header title="考试安排" subtitle="本学期考试时间与地点" />
      <div className="mx-auto w-full max-w-4xl flex-1 px-5 py-6 md:px-8">
        <FadeIn>
          <ExamsView
            semesters={semesters}
            initialSemester={semester}
            initial={cached}
            demoMode={demo}
          />
        </FadeIn>
      </div>
    </>
  );
}
