import { Header } from "@/components/dashboard/header";
import { FadeIn } from "@/components/motion/fade-in";
import { getCurrentSemester } from "@/features/calendar/calendar-data";
import { getWeekOfSemester } from "@/features/calendar/utils";
import { currentSemesterCode } from "@/features/courses/semesters";
import { ScheduleClient } from "@/features/schedule/schedule-client";

export const metadata = { title: "课程表" };

export default function SchedulePage() {
  const semester = getCurrentSemester();
  const currentWeek = getWeekOfSemester(semester) ?? 1;
  const semesterCode = currentSemesterCode();

  return (
    <>
      <Header title="课程表" subtitle={`${semester.name} · 第 ${currentWeek} 周`} />
      <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-8">
        <FadeIn>
          <ScheduleClient
            semesterCode={semesterCode}
            semesterName={semester.name}
            currentWeek={currentWeek}
          />
        </FadeIn>
      </div>
    </>
  );
}
