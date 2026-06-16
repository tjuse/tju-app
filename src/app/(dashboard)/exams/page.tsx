import { Header } from "@/components/dashboard/header";
import { FadeIn } from "@/components/motion/fade-in";
import { currentSemesterCode, listSemesters } from "@/features/courses/semesters";
import { ExamsView } from "@/features/exams/exams-view";

export const metadata = { title: "考试" };

export default function ExamsPage() {
  const semester = currentSemesterCode();
  const semesters = listSemesters();

  return (
    <>
      <Header title="考试安排" subtitle="本学期考试时间与地点" />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 md:px-8">
        <FadeIn>
          <ExamsView semesters={semesters} initialSemester={semester} />
        </FadeIn>
      </div>
    </>
  );
}
