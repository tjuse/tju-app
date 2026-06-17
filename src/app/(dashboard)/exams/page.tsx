import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { currentSemesterCode, listSemesters } from "@/features/courses/semesters";
import { ExamsView } from "@/features/exams/exams-view";

export const metadata = { title: "考试" };

export default function ExamsPage() {
  const semester = currentSemesterCode();
  const semesters = listSemesters();

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-6 md:px-8">
      <PageHeader title="考试安排" subtitle="本学期考试时间与地点" />
      <FadeIn>
        <ExamsView semesters={semesters} initialSemester={semester} />
      </FadeIn>
    </div>
  );
}
